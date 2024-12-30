const regionSelect = document.getElementById('region');
const districtSelect = document.getElementById('district');
const institutionSelect = document.getElementById('institution');
const tableBody = document.querySelector('#schedule-table tbody');
const loader = document.getElementById('loader');

// Функция для отображения индикатора загрузки
const showLoader = () => {
    loader.style.display = 'block';
};

// Функция для скрытия индикатора загрузки
const hideLoader = () => {
    loader.style.display = 'none';
};

// Функция для загрузки регионов
const fetchRegions = async () => {
    try {
        const response = await fetch('http://localhost:8000/api/regions/');
        const regions = await response.json();
        if (regions.length === 0) {
            regionSelect.innerHTML = '<option value="">Нет доступных регионов</option>';
        } else {
            regions.forEach(region => {
                const option = document.createElement('option');
                option.value = region;
                option.textContent = region;
                regionSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки регионов:', error);
        regionSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
    }
};

// Функция для загрузки районов
const fetchDistricts = async (region) => {
    try {
        districtSelect.innerHTML = '<option value="">Выберите район</option>';
        institutionSelect.innerHTML = '<option value="">Выберите учреждение</option>';
        tableBody.innerHTML = '<tr><td colspan="5">Выберите район и учреждение</td></tr>';
        if (!region) return;
        const response = await fetch(`http://localhost:8000/api/districts/${encodeURIComponent(region)}/`);
        const districts = await response.json();
        districts.forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка загрузки районов:', error);
    }
};

// Функция для загрузки учреждений
const fetchInstitutions = async (region, district) => {
    try {
        institutionSelect.innerHTML = '<option value="">Выберите учреждение</option>';
        if (!district) return;
        const response = await fetch(`http://localhost:8000/api/institutions/?region=${encodeURIComponent(region)}&district=${encodeURIComponent(district)}`);
        const institutions = await response.json();
        institutions.forEach(institution => {
            const option = document.createElement('option');
            option.value = institution;
            option.textContent = institution;
            institutionSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка загрузки учреждений:', error);
    }
};

// Функция для загрузки расписания
const fetchSchedule = async (region, district, institution) => {
    showLoader();
    try {
        tableBody.innerHTML = '<tr><td colspan="5">Данные загружаются...</td></tr>';
        const response = await fetch(`http://localhost:8000/api/schedule/?region=${encodeURIComponent(region)}&district=${encodeURIComponent(district)}&institution=${encodeURIComponent(institution)}`);
        const data = await response.json();
        tableBody.innerHTML = '';
        if (data.length > 0) {
            data.forEach(item => {
                const row = `
                    <tr>
                        <td>${item.institution || '-'}</td>
                        <td>${item.level || '-'}</td>
                        <td>${item.day || '-'}</td>
                        <td>${item.session || '-'}</td>
                        <td>${item.responsible || '-'}</td>
                    </tr>`;
                tableBody.insertAdjacentHTML('beforeend', row);
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="5">Нет данных для отображения</td></tr>';
        }
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="5">Ошибка загрузки данных</td></tr>';
        console.error('Ошибка загрузки расписания:', error);
    } finally {
        hideLoader();
    }
};

// События для управления фильтрами
regionSelect.addEventListener('change', () => {
    const selectedRegion = regionSelect.value;
    fetchDistricts(selectedRegion);
});

districtSelect.addEventListener('change', () => {
    const region = regionSelect.value;
    const district = districtSelect.value;
    fetchInstitutions(region, district);
});

institutionSelect.addEventListener('change', () => {
    const region = regionSelect.value;
    const district = districtSelect.value;
    const institution = institutionSelect.value;
    fetchSchedule(region, district, institution);
});

// Инициализация
fetchRegions();
