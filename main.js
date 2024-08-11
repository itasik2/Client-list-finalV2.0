// Получение элементов из DOM
const clientsTable = document.getElementById('clients-table'),
  modalContainer = document.getElementById('modal-container'),
  addClientForm = document.getElementById('add-client-form'),
  addBtn = document.getElementById('add-btn'),
  saveBtn = document.getElementById('save-client-btn'),
  modalTitle = document.getElementById('modal-title'),
  addContactBtn = document.getElementById('add-contact-btn'),
  closeBtn = document.getElementById('close-btn'),
  buttonContainer = document.getElementById('button-container'),
  modalConfirmDelete = document.getElementById('modal-confirm-delete'),
  clientsTableData = document.querySelectorAll('table th'),
  contactsContainer = document.getElementById('contacts-container'),
  contactInput = document.querySelectorAll('.contact-input'),
  modalContent = document.getElementById('modal-content'),
  modalHeader = document.getElementById('modal-header'),
  errorsContainer = document.getElementById('errors-container'),
  searchInput = document.getElementById('search-input');

let initialFormState = {};

function showPreloader() {
  document.getElementById('preloader').style.display = 'block';
}

function hidePreloader() {
  document.getElementById('preloader').style.display = 'none';
}

const serverClientsUrl = 'http://localhost:3000/api/clients/';

// Универсальная функция для выполнения запросов на сервер
async function serverRequest(endpoint, method, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(serverClientsUrl + endpoint, options);
  return await response.json();
}

// Функция для добавления клиента
async function serverAddClient(obj) {
  return await serverRequest('', 'POST', obj);
}

// Функция для получения списка клиентов
async function serverGetClients() {
  showPreloader(); // Показываем прелоадер
  try {
    const data = await serverRequest('', 'GET');
    hidePreloader(); // Скрываем прелоадер после получения ответа

    return data;
  } catch (error) {
    console.error('Ошибка при получении списка клиентов:', error);
    hidePreloader(); // Убедитесь, что прелоадер скрывается даже при ошибке
  }

}
// showPreloader();

// Функция для удаления клиента по ID
async function serverDeleteClient(id) {

  showPreloader(); // Показываем прелоадер
  try {
    const data = await serverRequest(id, 'DELETE');
    hidePreloader(); // Скрываем прелоадер после получения ответа

    return data;
  } catch (error) {
    console.error('Ошибка при удалении клиента:', error);
    hidePreloader(); // Убедитесь, что прелоадер скрывается даже при ошибке
  }

}

// Функция для редактирования клиента по ID
async function serverEditClient(id, obj) {

  showPreloader(); // Показываем прелоадер
  try {
    const data = await serverRequest(id, 'PATCH', obj);
    hidePreloader(); // Скрываем прелоадер после получения ответа

    return data;
  } catch (error) {
    console.error('Ошибка при редактировании клиента:', error);
    hidePreloader(); // Убедитесь, что прелоадер скрывается даже при ошибке
  }

}


// Функция для получения данных клиента по ID
async function serverGetClientById(clientId) {

  showPreloader(); // Показываем прелоадер
  try {
    const data = await serverRequest(clientId, 'GET');
    hidePreloader(); // Скрываем прелоадер после получения ответа

    return data;
  } catch (error) {
    console.error('Ошибка при получении клиента по ID:', error);
    hidePreloader(); // Убедитесь, что прелоадер скрывается даже при ошибке
  }

}

// Функция для поиска клиентов на сервере
async function serverSearchClients(query) {
  return await serverRequest(`?search=${encodeURIComponent(query)}`, 'GET');
}

let column = 'fio',
  columnDir = true;

// Инициализация массива клиентов
let clientsArr = await serverGetClients();

// Функция создания кнопки
function getBtn(innerHTML, className, id) {
  const btn = document.createElement('button');
  btn.innerHTML = innerHTML;
  btn.classList.add(className);
  btn.id = id;
  return btn;
}


function cancelAction() {
  modalContainer.classList.add('d-none'); // Скрытие модального окна
  addClientForm.reset(); // Сброс формы
  modalConfirmDelete.classList.add('d-none')
  modalConfirmDelete.innerHTML = ''; // Очистка содержимого окна подтверждения удаления
  contactsContainer.innerHTML = ''; // Очистка полей контактов
  errorsContainer.innerHTML = ''; // Очистка сообщений об ошибках
}


// кнопка "Отмена"
const cancelBtn = getBtn('Отмена', 'cancel-btn', 'cancelBtn');


// Функция для получения ФИО клиента
function getFio(surname, name, lastname) {
  return `${surname} ${name} ${lastname}`;
}

// функция для форматирования даты и времени
function formatDateTime(date) {
  date = new Date(date); // Изменение: используем переданную дату
  // Получение компонентов даты
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы в Date объекте нумеруются с 0
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  // Возвращаем отформатированную строку
  return `${day}.${month}.${year} <span class="time light-text">${hours}:${minutes}</span>`;
}

// Функция добавления изображения
function getImage(src, alt = '', className = '') {
  const img = new Image();
  img.src = src;
  img.alt = alt;
  if (className) {
    img.classList.add(className);
  }
  return img;
}

// Функция создания иконки контакта
function createContactIcon(contact) {
  let img;
  let tooltipType = contact.type;
  let tooltipValue = contact.value;
  switch (contact.type) {
    case 'Телефон':
      img = getImage('img/phone-icon.svg', 'Телефон', 'contact-icon');
      break;
    case 'Другое':
      img = getImage('img/phone-alt-icon.svg', `${tooltipType}`, 'contact-icon');
      break;
    case 'Email':
      img = getImage('img/email-icon.svg', 'Email', 'contact-icon');
      break;
    case 'Vk':
      img = getImage('img/vk-icon.svg', 'Vk', 'contact-icon');
      break;
    case 'Facebook':
      img = getImage('img/facebook-icon.svg', 'Facebook', 'contact-icon');
      break;
    default:
      img = getImage('img/contact-icon.svg', 'Контакт', 'contact-icon');
  }

  return `<span id="tippy-contact" data-tippy-content='<div class="tooltip-content">${tooltipType}: <a href="" target="_blank">${tooltipValue}</a></div>'>${img.outerHTML}</span>`;
}

// Функция для отображения скрытых контактов
function showHiddenContacts(button) {
  const contactsWrapper = button.closest('.contacts-wrapper');
  const hiddenContacts = contactsWrapper.querySelector('.hidden-contacts');
  hiddenContacts.classList.remove('d-none');
  hiddenContacts.classList.add('d-block');
  button.classList.add('d-none');
  contactsWrapper.classList.add('flex-column');
  contactsWrapper.classList.add('align-items-start')
}

// Делегирование событий на таблицу клиентов
clientsTable.addEventListener('click', (event) => {
  if (event.target.classList.contains('hidden-contacts-btn')) {
    showHiddenContacts(event.target);
  }
});

// функция добавления контакта
function getContacts(contacts) {
  const visibleContacts = contacts.slice(0, 5).map(contact => createContactIcon(contact)).join(' ');
  const hiddenContactsCount = contacts.length - 5;

  const hiddenButton = hiddenContactsCount > 0 ? `
        <button class="hidden-contacts-btn">
            +${hiddenContactsCount}
        </button>` : '';

  const contactsHTML = `
        <div class="contacts-wrapper d-flex justify-content-center">
            <div class="visible-contacts">${visibleContacts}</div>
            <div class="hidden-contacts d-none">${contacts.slice(5).map(contact => createContactIcon(contact)).join(' ')}</div>
            ${hiddenButton}
        </div>`;

  const container = document.createElement('div');
  container.innerHTML = contactsHTML;

  return container.innerHTML;
}

// Создаёт поле ввода контакта
function createContactInput(contact = {
  type: 'Телефон',
  value: ''
}) {
  const contactDiv = document.createElement('div');
  contactDiv.classList.add('contact-input', 'd-flex');
  // селект с типом контакта
  const selectHTML = `
    <select class="form-select d-flex contact-type">
      <option value="Телефон" ${contact.type === 'Телефон' ? 'selected' : ''}>Телефон</option>
      <option value="Email" ${contact.type === 'Email' ? 'selected' : ''}>Email</option>
      <option value="Vk" ${contact.type === 'Vk' ? 'selected' : ''}>Vk</option>
      <option value="Facebook" ${contact.type === 'Facebook' ? 'selected' : ''}>Facebook</option>
      <option value="Другое" ${contact.type === 'Другое' ? 'selected' : ''}>Другое</option>
    </select>
  `;
  // значение контакта и кнопка очистки
  const valueInputHTML = `
    <div class="value-input-wrapper d-flex">
      <input type="text" class="contact-value" value="${contact.value}" placeholder="Введите значение">
      <button type="button" class="clear-btn d-none">${getImage('./img/clear-icon.svg', '', 'clear-btn-icon').outerHTML}</button>
    </div>
  `;

  contactDiv.innerHTML = `
    ${selectHTML}
    ${valueInputHTML}
  `;

  const valueInput = contactDiv.querySelector('.contact-value');
  const clearInputBtn = contactDiv.querySelector('.clear-btn');

  // Обработчик ввода значения в поле контакта
  valueInput.addEventListener('input', () => {
    if (valueInput.value.trim() !== '') {
      clearInputBtn.classList.remove('d-none');
    } else {
      clearInputBtn.classList.add('d-none');
    }
  });

  // Обработчик нажатия на кнопку очистки
  clearInputBtn.addEventListener('click', () => {
    valueInput.value = '';
    clearInputBtn.classList.add('d-none');
    contactDiv.remove(contactInput)
  });

  // Показываем кнопку очистки, если в поле уже есть данные
  if (contact.value.trim() !== '') {
    clearInputBtn.classList.remove('d-none');
  }

  return contactDiv;
}

// Функция добавления нового контакта в форму
function addContact() {
  const contactInputs = document.querySelectorAll('.contact-input');
  if (contactInputs.length >= 10) {
    addContactBtn.style.display = 'none'; // Скрыть кнопку, если контактов 10 или больше
    return;
  }
  const contactDiv = createContactInput();
  contactsContainer.appendChild(contactDiv);
  addContactBtn.style.display = 'block'; // Показать кнопку, если контактов меньше 10
}

// обработчик события на кнопку "Добавить контакт"
addContactBtn.addEventListener('click', addContact);


// Валидация формы клиента
function validateClientForm() {
  const errors = [];

  const nameInput = document.getElementById('name');
  const surnameInput = document.getElementById('surname');
  // const lastnameInput = document.getElementById('lastName');
  const contactInputs = document.querySelectorAll('.contact-input');

  if (!nameInput.value.trim()) {
    errors.push('Имя не может быть пустым.');
  }

  if (!surnameInput.value.trim()) {
    errors.push('Фамилия не может быть пустой.');
  }

  contactInputs.forEach((contactInput, index) => {
    const contactType = contactInput.querySelector('.contact-type').value;
    const contactValue = contactInput.querySelector('.contact-value').value.trim();

    if (!contactValue) {

      errors.push(`Значение контакта №${index + 1} (${contactType}) не может быть пустым.`);
    }

  });

  return errors;
}

// Функция заполнения формы данными клиента
function fillForm(client) {
  const {
    name,
    surname,
    lastName,
    contacts
  } = client;

  document.getElementById('name').value = name;
  document.getElementById('surname').value = surname;
  document.getElementById('lastName').value = lastName;

  contactsContainer.innerHTML = '';
  contacts.forEach(contact => {
    const contactInput = createContactInput(contact);
    contactsContainer.appendChild(contactInput);
  });

  // Скрыть кнопку "Добавить контакт", если контактов 10 или больше
  if (contacts.length >= 10) {
    addContactBtn.style.display = 'none';
  } else {
    addContactBtn.style.display = 'block';
  }
}

// Функция сохранения начального состояния формы
function saveInitialFormState() {
  initialFormState = new FormData(addClientForm);
}

// Функция проверки изменений в форме
function isFormChanged() {
  const currentFormState = new FormData(addClientForm);

  for (let [key, value] of currentFormState.entries()) {
    if (initialFormState.get(key) !== value) {
      return true;
    }
  }

  return false;
}

// Открытие модального окна для добавления клиента
addBtn.addEventListener('click', () => {
  modalContainer.classList.remove('d-none');
  modalTitle.innerHTML = 'Новый клиент';
  modalContent.classList.remove('d-none')
  buttonContainer.innerHTML = ''; // Очистка контейнера кнопок
  addClientForm.reset();
  contactsContainer.innerHTML = '';
  errorsContainer.innerHTML = '';
  modalConfirmDelete.innerHTML = '';
  addContact(); // Добавляем пустой контакт при открытии формы
  saveInitialFormState(); // Сохранение начального состояния формы
  buttonContainer.appendChild(cancelBtn);

  addContactBtn.style.display = 'block'; // Показать кнопку "Добавить контакт" при открытии формы

  cancelBtn.addEventListener('click', () => cancelAction())
  // Добавление обработчика на кнопку закрытия формы
  ;
});

// Закрытие модального окна
closeBtn.addEventListener('click', () => {
  if (isFormChanged()) {

    modalContainer.classList.add('d-none');
    addClientForm.reset();
    contactsContainer.innerHTML = '';
    errorsContainer.innerHTML = '';

  } else {
    modalContainer.classList.add('d-none');
    addClientForm.reset();
    contactsContainer.innerHTML = '';
    errorsContainer.innerHTML = '';
  }
});

// Функция для добавления нового клиента или обновления существующего
async function addOrUpdateClient(event) {
  event.preventDefault();

  // Проверка изменений в форме
  if (!isFormChanged()) {
    console.log('Изменений в форме нет. Данные не отправлены.');
    modalContainer.classList.add('d-none');
    addClientForm.reset();
    contactsContainer.innerHTML = ''; // Очистка полей контактов
    errorsContainer.innerHTML = ''; // Очистка сообщений об ошибках
    return;
  }

  const clientId = addBtn.dataset.editId; // Получаем ID клиента, если он редактируется

  const name = document.getElementById('name').value.trim();
  const surname = document.getElementById('surname').value.trim();
  const lastname = document.getElementById('lastName').value.trim();

  const contacts = Array.from(document.querySelectorAll('.contact-input')).map(contactInput => {
    const type = contactInput.querySelector('.contact-type').value;
    const value = contactInput.querySelector('.contact-value').value.trim();

    return {
      type,
      value
    };

  });
  console.log(contacts);

  const errors = validateClientForm();
  if (errors.length > 0) {
    errorsContainer.innerHTML = errors.join('<br>');
    return;
  }

  const newClient = {
    name,
    surname,
    lastName: lastname,
    contacts
  };

  try {
    if (clientId) {
      // Редактирование клиента
      await serverEditClient(clientId, newClient);
    } else {
      // Добавление нового клиента
      await serverAddClient(newClient);
    }

    modalContainer.classList.add('d-none');
    addClientForm.reset();
    contactsContainer.innerHTML = ''; // Очистка полей контактов
    clientsArr = await serverGetClients(); // Обновление массива клиентов
    render();
  } catch (error) {
    console.error('Ошибка при добавлении/редактировании клиента:', error);
  }
}

saveBtn.addEventListener('click', addOrUpdateClient);

// Функция для подтверждения удаления клиента
function confirmDeleteClient(clientId) {
  modalContainer.classList.remove('d-none');
  modalContent.classList.add('d-none');
  modalHeader.classList.remove('justify-content-between');
  modalTitle.innerHTML = 'Удалить клиента';
  modalTitle.classList.add('delete-title');
  modalConfirmDelete.classList.remove('d-none')
  modalConfirmDelete.innerHTML = `
      <p class="modal-confirm-delete-desc text">
        Вы действительно хотите удалить<br>данного клиента?
      </p>
      <div class="modal-confirm-btn-wrap d-flex flex-column">
        <button class="confirm-delete-btn modal-btn" id="confirm-delete-btn">Удалить</button>
        ${cancelBtn.outerHTML}
      </div>
      `;

  document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    await serverDeleteClient(clientId);
    modalContainer.classList.add('d-none');
    modalContent.classList.add('d-none');
    modalConfirmDelete.innerHTML = '';
    clientsArr = await serverGetClients(); // Обновление массива клиентов
    render();
  });



  document.getElementById('cancelBtn').addEventListener('click', () => {
    cancelAction();
  });
  modalContainer.classList.remove('d-none');
}

// Функция для открытия модального окна с заполнением формы данными клиента
async function openEditClientForm(clientId) {

  const client = await serverGetClientById(clientId);
  fillForm(client);
  modalConfirmDelete.classList.add('d-none')
  modalContainer.classList.remove('d-none');
  modalContent.classList.remove('d-none');
  modalTitle.innerHTML = `Изменить данные <span class="span-id light-text"> ID: ${client.id}</span>`;
  modalTitle.classList.remove('delete-title');
  addBtn.dataset.editId = client.id;

  // Добавление кнопки "Удалить клиента" в форму редактирования
  buttonContainer.innerHTML = '';
  const deleteClientBtn = getBtn('Удалить клиента', 'delete-client-btn', `delete-client-${client.id}`);
  deleteClientBtn.addEventListener('click', () => {
    confirmDeleteClient(client.id);
    modalContent.classList.add('d-none');
  });

  buttonContainer.appendChild(deleteClientBtn);

}

// Сортировка списка
clientsTableData.forEach(elem => {
  elem.addEventListener('click', function () {
    if (this.dataset.column) {
      column = this.dataset.column;
      columnDir = !columnDir;
      render();
    }
  });
});

// функция сортировки
function getSortClients(prop, dir) {
  return clientsArr.sort(function (clientA, clientB) {
    let propA = clientA[prop],
      propB = clientB[prop];

    if (prop === 'fio') {
      propA = getFio(clientA.surname, clientA.name, clientA.lastname);
      propB = getFio(clientB.surname, clientB.name, clientB.lastname);
    }

    if ((!dir ? propA < propB : propA > propB))
      return -1;
    return 1;
  });
}

// Функция обновления иконок сортировки и указателей
function updateSortIcons() {
  clientsTableData.forEach(th => {
    const icon = th.querySelector('.sort-icon');
    const order = th.querySelector('.sort-order');

    if (th.dataset.column === column) {
      th.classList.add('sorted');
      icon.classList.toggle('asc', columnDir);
      icon.classList.toggle('desc', !columnDir);
      if (order) {
        if (th.dataset.column === 'fio') {
          order.textContent = columnDir ? 'А-Я' : 'Я-А';
        }
      }
    } else {
      th.classList.remove('sorted');
    }
  });

}

//фильтрация
searchInput.addEventListener('input', async (event) => {
  const query = event.target.value.trim();
  if (query) {
    try {
      const searchResults = await serverSearchClients(query);
      clientsArr = searchResults
      render();
    } catch (error) {
      console.error('Ошибка при поиске клиентов:', error);
    }
  } else {
    // Если поле поиска пустое, отображаем весь список клиентов
    render();
  }
});


function render() {
  clientsTable.innerHTML = '';

  clientsArr = getSortClients(column, columnDir);

  clientsArr.forEach(client => {
    const clientTR = document.createElement('tr');

    clientTR.innerHTML = `
          <td class="client-id light-text" id="client-id">${client.id}</td>
          <td class="client-fio text" id="client-fio">${getFio(client.surname, client.name, client.lastName)}</td>
          <td class="client-create-time text" id="client-create-time">${formatDateTime(client.createdAt)}</td>
          <td class="client-update-time text" id="client-update-time">${formatDateTime(client.updatedAt)}</td>
          <td class="client-contacts" id="client-contacts">${getContacts(client.contacts)}</td>
      `;


    const editBtn = getBtn(`${getImage('./img/edit.svg', 'Изменить', 'edit-img').outerHTML} Изменить`, 'editBtn', `edit-${client.id}`);
    editBtn.addEventListener('click', () => openEditClientForm(client.id));

    // Создание кнопки "Удалить" и добавление обработчика события
    const deleteBtn = getBtn(`${getImage('./img/delete-icon.svg', 'Удалить', 'delete-img').outerHTML} Удалить`, 'deleteBtn', `delete-${client.id}`);
    deleteBtn.addEventListener('click', () => confirmDeleteClient(client.id));


    // Добавление кнопок в строку таблицы
    const btnTd = document.createElement('td');
    btnTd.appendChild(editBtn);
    btnTd.appendChild(deleteBtn);
    clientTR.appendChild(btnTd);

    clientsTable.appendChild(clientTR);
  });



  // tippy('[data-tippy-content]');
  tippy('#tippy-contact', {
    allowHTML: true,
    interactive: true,
  });

  updateSortIcons();
}


render();

// Обработчик события на кнопку "Закрыть" для модального окна подтверждения удаления
modalContainer.addEventListener('click', event => {
  if (event.target === modalContainer) {
    cancelAction()
  }
});
