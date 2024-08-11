// Получение элементов из DOM
const clientsTable = document.getElementById('clients-table'),
  modalContainer = document.getElementById('modal-container'),
  modalContent = document.getElementById('modal-content'),
  addClientForm = document.getElementById('add-client-form'),
  addBtn = document.getElementById('add-btn'),
  saveBtn = document.getElementById('save-client-btn'),
  modalTitle = document.getElementById('modal-title'),
  addContactBtn = document.getElementById('add-contact-btn'),
  closeBtn = document.getElementById('close-btn'),
  buttonContainer = document.getElementById('button-container'),
  modalConfirmDelete = document.getElementById('modal-confirm-delete'),
  clientsTableData = document.querySelectorAll('table th'),
  modalHeader = document.getElementById('modal-header'),
  contactsContainer = document.getElementById('contacts-container'),
  errorsContainer = document.getElementById('errors-container'),
  searchInput = document.getElementById('search-input');

let initialFormState = {};

function togglePreloader(show) {
  document.getElementById('preloader').style.display = show ? 'block' : 'none';
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

// Функции для работы с клиентами
async function serverAddClient(obj) {
  return await serverRequest('', 'POST', obj);
}

async function serverGetClients() {
  togglePreloader(true);
  try {
    const data = await serverRequest('', 'GET');
    return data;
  } catch (error) {
    console.error('Ошибка при получении списка клиентов:', error);
  } finally {
    togglePreloader(false);
  }
}

async function serverDeleteClient(id) {
  togglePreloader(true);
  try {
    const data = await serverRequest(id, 'DELETE');
    return data;
  } catch (error) {
    console.error('Ошибка при удалении клиента:', error);
  } finally {
    togglePreloader(false);
  }
}

async function serverEditClient(id, obj) {
  togglePreloader(true);
  try {
    const data = await serverRequest(id, 'PATCH', obj);
    return data;
  } catch (error) {
    console.error('Ошибка при редактировании клиента:', error);
  } finally {
    togglePreloader(false);
  }
}

async function serverGetClientById(clientId) {
  togglePreloader(true);
  try {
    const data = await serverRequest(clientId, 'GET');
    return data;
  } catch (error) {
    console.error('Ошибка при получении клиента по ID:', error);
  } finally {
    togglePreloader(false);
  }
}

async function serverSearchClients(query) {
  return await serverRequest(`?search=${encodeURIComponent(query)}`, 'GET');
}

let column = 'fio',
  columnDir = true;

// Инициализация массива клиентов
let clientsArr = await serverGetClients();

// Функция создания кнопки
function createButton(innerHTML, className, id) {
  const btn = document.createElement('button');
  btn.innerHTML = innerHTML;
  btn.classList.add(className);
  btn.id = id;
  return btn;
}

function resetModal() {
  modalContainer.classList.add('d-none');
  addClientForm.reset();
  modalConfirmDelete.classList.add('d-none');
  modalConfirmDelete.innerHTML = '';
  contactsContainer.innerHTML = '';
  errorsContainer.innerHTML = '';
}

const cancelBtn = createButton('Отмена', 'cancel-btn', 'cancelBtn');

function getFio(surname, name, lastname) {
  return `${surname} ${name} ${lastname}`;
}

function formatDateTime(date) {
  date = new Date(date);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} <span class="time light-text">${hours}:${minutes}</span>`;
}

function getImage(src, alt = '', className = '') {
  const img = new Image();
  img.src = src;
  img.alt = alt;
  if (className) img.classList.add(className);
  return img;
}

function createContactIcon(contact) {
  const contactIcons = {
    'Телефон': 'img/phone-icon.svg',
    'Другое': 'img/phone-alt-icon.svg',
    'Email': 'img/email-icon.svg',
    'Vk': 'img/vk-icon.svg',
    'Facebook': 'img/facebook-icon.svg'
  };
  const imgSrc = contactIcons[contact.type] || 'img/contact-icon.svg';
  const img = getImage(imgSrc, contact.type, 'contact-icon');
  return `<span id="tippy-contact" data-tippy-content='<div class="tooltip-content">${contact.type}: <a href="" target="_blank">${contact.value}</a></div>'>${img.outerHTML}</span>`;
}

function showHiddenContacts(button) {
  const contactsWrapper = button.closest('.contacts-wrapper');
  const hiddenContacts = contactsWrapper.querySelector('.hidden-contacts');
  hiddenContacts.classList.toggle('d-none');
  button.classList.toggle('d-none');
  contactsWrapper.classList.toggle('flex-column');
  contactsWrapper.classList.toggle('align-items-start');
}

clientsTable.addEventListener('click', (event) => {
  if (event.target.classList.contains('hidden-contacts-btn')) {
    showHiddenContacts(event.target);
  }
});

function getContacts(contacts) {
  const visibleContacts = contacts.slice(0, 5).map(createContactIcon).join(' ');
  const hiddenContactsCount = contacts.length - 5;
  const hiddenButton = hiddenContactsCount > 0 ? `<button class="hidden-contacts-btn">+${hiddenContactsCount}</button>` : '';
  return `
    <div class="contacts-wrapper d-flex justify-content-center">
      <div class="visible-contacts">${visibleContacts}</div>
      <div class="hidden-contacts d-none">${contacts.slice(5).map(createContactIcon).join(' ')}</div>
      ${hiddenButton}
    </div>`;
}

function createContactInput(contact = {
  type: 'Телефон',
  value: ''
}) {
  const contactDiv = document.createElement('div');
  contactDiv.classList.add('contact-input', 'd-flex');
  contactDiv.innerHTML = `
    <select class="form-select d-flex contact-type">
      <option value="Телефон" ${contact.type === 'Телефон' ? 'selected' : ''}>Телефон</option>
      <option value="Email" ${contact.type === 'Email' ? 'selected' : ''}>Email</option>
      <option value="Vk" ${contact.type === 'Vk' ? 'selected' : ''}>Vk</option>
      <option value="Facebook" ${contact.type === 'Facebook' ? 'selected' : ''}>Facebook</option>
      <option value="Другое" ${contact.type === 'Другое' ? 'selected' : ''}>Другое</option>
    </select>
    <div class="value-input-wrapper d-flex">
      <input type="text" class="contact-value" value="${contact.value}" placeholder="Введите значение">
      <button type="button" class="clear-btn d-none">${getImage('./img/clear-icon.svg', '', 'clear-btn-icon').outerHTML}</button>
    </div>
  `;

  const valueInput = contactDiv.querySelector('.contact-value');
  const clearInputBtn = contactDiv.querySelector('.clear-btn');

  valueInput.addEventListener('input', () => {
    clearInputBtn.classList.toggle('d-none', !valueInput.value.trim());
  });

  clearInputBtn.addEventListener('click', () => {
    valueInput.value = '';
    clearInputBtn.classList.add('d-none');
    contactsContainer.removeChild(contactDiv);

    // Показать кнопку "Добавить контакт", если контактов меньше 10
    if (contactsContainer.children.length < 10) {
      addContactBtn.style.display = 'block';
    }

    // Обновить начальное состояние формы после удаления контакта
    saveInitialFormState();
  });

  if (contact.value.trim()) {
    clearInputBtn.classList.remove('d-none');
  }

  return contactDiv;
}



function addContact() {
  if (contactsContainer.children.length >= 10) {
    addContactBtn.style.display = 'none';
    return;
  }
  contactsContainer.appendChild(createContactInput());
  addContactBtn.style.display = 'block';
}

addContactBtn.addEventListener('click', addContact);

function validateClientForm() {
  const errors = [];
  const nameInput = document.getElementById('name');
  const surnameInput = document.getElementById('surname');
  const contactInputs = document.querySelectorAll('.contact-input');

  if (!nameInput.value.trim()) errors.push('Имя не может быть пустым.');
  if (!surnameInput.value.trim()) errors.push('Фамилия не может быть пустой.');

  contactInputs.forEach((contactInput, index) => {
    const contactValue = contactInput.querySelector('.contact-value').value.trim();
    if (!contactValue) {
      errors.push(`Значение контакта №${index + 1} не может быть пустым.`);
    }
  });

  return errors;
}

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
  contacts.forEach(contact => contactsContainer.appendChild(createContactInput(contact)));

  addContactBtn.style.display = contacts.length >= 10 ? 'none' : 'block';

  // Сохранение начального состояния формы
  initialFormState = getFormState();
}


// Функция для получения текущего состояния формы
function getFormState() {

  const surname = document.getElementById('surname').value.trim(),
    name = document.getElementById('name').value.trim(),
    lastName = document.getElementById('lastName').value.trim(),
    contactInputs = document.querySelectorAll('.contact-input'),
    contacts = Array.from(contactInputs).map(input => {
      return {
        type: input.querySelector('select').value,
        value: input.querySelector('input').value.trim()
      };
    });
  return {
    surname,
    name,
    lastName,
    contacts
  };
}

function saveInitialFormState() {
  initialFormState = new FormData(addClientForm);
}



function isFormChanged() {
  const currentFormState = getFormState();
  return JSON.stringify(currentFormState) !== JSON.stringify(initialFormState);
}



addBtn.addEventListener('click', () => {
  modalContainer.classList.remove('d-none');
  modalTitle.innerHTML = 'Новый клиент';
  modalContent.classList.remove('d-none');
  buttonContainer.innerHTML = '';
  addClientForm.reset();
  contactsContainer.innerHTML = '';
  errorsContainer.innerHTML = '';
  modalConfirmDelete.innerHTML = '';
  addContact();
  saveInitialFormState(); // Сохранение начального состояния формы
  buttonContainer.appendChild(cancelBtn);
  addContactBtn.style.display = 'block';
  cancelBtn.addEventListener('click', resetModal);
});

closeBtn.addEventListener('click', resetModal);

async function addOrUpdateClient(event) {
  event.preventDefault();

  if (!isFormChanged()) {
    console.log('Изменений в форме нет. Данные не отправлены.');
    resetModal();
    return;
  }

  const clientId = addBtn.dataset.editId;
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
      await serverEditClient(clientId, newClient);
    } else {
      await serverAddClient(newClient);
    }

    resetModal();
    clientsArr = await serverGetClients();
    render();
  } catch (error) {
    console.error('Ошибка при добавлении/редактировании клиента:', error);
  }
}


saveBtn.addEventListener('click', addOrUpdateClient);

function confirmDeleteClient(clientId) {
  modalContainer.classList.remove('d-none');
  modalContent.classList.add('d-none');
  modalHeader.classList.remove('justify-content-between');
  modalTitle.innerHTML = 'Удалить клиента';
  modalTitle.classList.add('delete-title');
  modalConfirmDelete.classList.remove('d-none');
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
    resetModal();
    clientsArr = await serverGetClients();
    render();
  });

  document.getElementById('cancelBtn').addEventListener('click', resetModal);
}

async function openEditClientForm(clientId) {
  const client = await serverGetClientById(clientId);
  saveInitialFormState();
  fillForm(client);
  modalConfirmDelete.classList.add('d-none');
  modalContainer.classList.remove('d-none');
  modalContent.classList.remove('d-none');
  modalTitle.innerHTML = `Изменить данные <span class="span-id light-text"> ID: ${client.id}</span>`;
  modalTitle.classList.remove('delete-title');
  addBtn.dataset.editId = client.id;

  buttonContainer.innerHTML = '';
  const deleteClientBtn = createButton('Удалить клиента', 'delete-client-btn', `delete-client-${client.id}`);
  deleteClientBtn.addEventListener('click', () => {
    confirmDeleteClient(client.id);
    modalContent.classList.add('d-none');
  });

  buttonContainer.appendChild(deleteClientBtn);
}

clientsTableData.forEach(elem => {
  elem.addEventListener('click', function () {
    if (this.dataset.column) {
      column = this.dataset.column;
      columnDir = !columnDir;
      render();
    }
  });
});

function getSortClients(prop, dir) {
  return clientsArr.sort((clientA, clientB) => {
    let propA = clientA[prop],
      propB = clientB[prop];
    if (prop === 'fio') {
      propA = getFio(clientA.surname, clientA.name, clientA.lastname);
      propB = getFio(clientB.surname, clientB.name, clientB.lastname);
    }
    return (!dir ? propA < propB : propA > propB) ? -1 : 1;
  });
}

function updateSortIcons() {
  clientsTableData.forEach(th => {
    const icon = th.querySelector('.sort-icon');
    const order = th.querySelector('.sort-order');

    if (th.dataset.column === column) {
      th.classList.add('sorted');
      icon.classList.toggle('asc', columnDir);
      icon.classList.toggle('desc', !columnDir);
      if (order && th.dataset.column === 'fio') {
        order.textContent = columnDir ? 'А-Я' : 'Я-А';
      }
    } else {
      th.classList.remove('sorted');
    }
  });
}

searchInput.addEventListener('input', async (event) => {
  const query = event.target.value.trim();
  if (query) {
    try {
      clientsArr = await serverSearchClients(query);
    } catch (error) {
      console.error('Ошибка при поиске клиентов:', error);
    }
  } else {
    clientsArr = await serverGetClients();
  }
  render();
});

function render() {
  clientsTable.innerHTML = '';
  clientsArr = getSortClients(column, columnDir);

  clientsArr.forEach(client => {
    const clientTR = document.createElement('tr');
    clientTR.innerHTML = `
      <td class="client-id light-text">${client.id}</td>
      <td class="client-fio text">${getFio(client.surname, client.name, client.lastName)}</td>
      <td class="client-create-time text">${formatDateTime(client.createdAt)}</td>
      <td class="client-update-time text">${formatDateTime(client.updatedAt)}</td>
      <td class="client-contacts">${getContacts(client.contacts)}</td>
    `;

    const editBtn = createButton(`${getImage('./img/edit.svg', 'Изменить', 'edit-img').outerHTML} Изменить`, 'editBtn', `edit-${client.id}`);
    editBtn.addEventListener('click', () => openEditClientForm(client.id));

    const deleteBtn = createButton(`${getImage('./img/delete-icon.svg', 'Удалить', 'delete-img').outerHTML} Удалить`, 'deleteBtn', `delete-${client.id}`);
    deleteBtn.addEventListener('click', () => confirmDeleteClient(client.id));

    const btnTd = document.createElement('td');
    btnTd.appendChild(editBtn);
    btnTd.appendChild(deleteBtn);
    clientTR.appendChild(btnTd);

    clientsTable.appendChild(clientTR);
  });

  tippy('#tippy-contact', {
    allowHTML: true,
    interactive: true,
  });

  updateSortIcons();
}

render();

modalContainer.addEventListener('click', event => {
  if (event.target === modalContainer) {
    resetModal();
  }
});
