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
  modalContent = document.getElementById('modal-content'),
  modalHeader = document.getElementById('modal-header'),
  errorsContainer = document.getElementById('errors-container');

let initialFormState = {};


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
  return await serverRequest('', 'GET');
}

// Функция для удаления клиента по ID
async function serverDeleteClient(id) {
  return await serverRequest(id, 'DELETE');
}

// Функция для редактирования клиента по ID
async function serverEditClient(id, obj) {
  return await serverRequest(id, 'PATCH', obj);
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
  modalContainer.classList.add('d-none');
  addClientForm.reset();
  modalConfirmDelete.innerHTML = '';
  contactsContainer.innerHTML = ''; // Очистка полей контактов
  errorsContainer.innerHTML = '';
}



// кнопка "Отмена"
const cancelBtn = getBtn('Отмена', 'cancel-btn', 'cancelBtn');
cancelAction(cancelBtn);

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


//функция добавления контакта
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


// Созаёт поле ввода контакта
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
    valueInput.focus();
  });

  // Показываем кнопку очистки, если в поле уже есть данные
  if (contact.value.trim() !== '') {
    clearInputBtn.classList.remove('d-none');
  }

  return contactDiv;
}


// Функция для заполнения формы данными клиента


function fillForm(client) {
  // Заполнение основных полей формы
  document.getElementById('surname').value = client.surname;
  document.getElementById('name').value = client.name;
  document.getElementById('lastName').value = client.lastName || '';

  // Очистка предыдущих контактов
  contactsContainer.innerHTML = '';
  // Добавление существующих контактов в форму
  if (client.contacts && client.contacts.length > 0) {
    client.contacts.forEach(contact => {

      contactsContainer.appendChild(createContactInput(contact));

    });
  }

  // Сохранение начального состояния формы
  initialFormState = getFormState();
  // saveBtn.disabled = true; // Деактивация кнопки сохранения
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

// Функция для сравнения текущего состояния формы с начальным состоянием
function isFormChanged() {
  const currentFormState = getFormState();
  return JSON.stringify(currentFormState) !== JSON.stringify(initialFormState);
}

// Функция для удаления клиента
async function deleteClient(clientId) {
  await serverDeleteClient(clientId);
  clientsArr = clientsArr.filter(client => client.id !== clientId);
  render();
  modalConfirmDelete.innerHTML = '';
}

// Функция для подтверждения удаления клиента
function confirmDeleteClient(clientId) {
  modalContainer.classList.remove('d-none');
  modalContent.classList.add('d-none');
  modalHeader.classList.remove('justify-content-between');
  modalTitle.innerHTML = 'Удалить клиента';
  modalTitle.classList.add('delete-title');
  modalConfirmDelete.innerHTML = `
      <p class="modal-confirm-delete-desc text">
        Вы действительно хотите удалить<br>данного клиента?
      </p>
      <div class="modal-confirm-btn-wrap d-flex flex-column">
        <button class="confirm-delete-btn modal-btn" id="confirm-delete-btn">Удалить</button>
        ${cancelBtn.outerHTML}
      </div>
      `;
  document.getElementById('confirm-delete-btn').addEventListener('click', () => deleteClient(clientId));
  document.getElementById('cancelBtn').addEventListener('click', () => {
    modalConfirmDelete.innerHTML = '';
    modalContainer.classList.add('d-none');
  });

}

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

// функция фильтрации
function filter(arr, prop, value) {
  let result = [],
    copy = [...arr]
  for (const item of copy) {
    if (String(item[prop]).toLowerCase().includes(value.toLowerCase())) result.push(item)
  }
  console.log(result);
  return result

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

// Функция для отображения списка клиентов в таблице
function render() {
  clientsTable.innerHTML = '';
  // Копирует массив
  let newArr = [...clientsArr]
  newArr = getSortClients(column, columnDir);

  newArr.forEach(client => {
    const clientTR = document.createElement('tr');

    clientTR.innerHTML = `
            <td class="client-id light-text" id="client-id">${client.id}</td>
            <td class="client-fio text" id="client-fio">${getFio(client.surname, client.name, client.lastName)}</td>
            <td class="client-create-time text" id="client-create-time">${formatDateTime(client.createdAt)}</td>
            <td class="client-update-time text" id="client-update-time">${formatDateTime(client.updatedAt)}</td>
            <td class="client-contacts" id="client-contacts">${getContacts(client.contacts)}</td>
        `;

    // Создание кнопки "Изменить" и добавление обработчика события
    const editBtn = getBtn(`${getImage('./img/edit.svg', 'Изменить', 'edit-img').outerHTML} Изменить`, 'editBtn', `edit-${client.id}`);
    editBtn.addEventListener('click', () => {
      fillForm(client);
      modalContainer.classList.remove('d-none');
      modalContent.classList.remove('d-none')
      modalTitle.innerHTML = `Изменить данные <span class="span-id light-text"> ID: ${client.id}</span>`;
      modalTitle.classList.remove('delete-title')
      addBtn.dataset.editId = client.id;

      // Добавление кнопки "Удалить клиента" в форму редактирования
      buttonContainer.innerHTML = '';
      const deleteClientBtn = getBtn('Удалить клиента', 'delete-client-btn', `delete-client-${client.id}`);
      deleteClientBtn.addEventListener('click', () => {
        confirmDeleteClient(client.id);
        modalContent.classList.add('d-none');
      });

      buttonContainer.appendChild(deleteClientBtn);
    });

    // Создание кнопки "Удалить" в таблице и добавление обработчика события
    const deleteBtn = getBtn(`${getImage('./img/delete-icon.svg', 'Удалить', 'delete-img').outerHTML} Удалить`, 'deleteBtn', `delete-${client.id}`);
    deleteBtn.addEventListener('click', () => confirmDeleteClient(client.id));

    // Добавление кнопок в строку таблицы
    const btnTd = document.createElement('td');
    btnTd.appendChild(editBtn);
    btnTd.appendChild(deleteBtn);
    clientTR.appendChild(btnTd);

    clientsTable.appendChild(clientTR);
  });

  ;

  // tippy('[data-tippy-content]');
  tippy('#tippy-contact', {
    allowHTML: true,
    interactive: true,
  });

  updateSortIcons()
}


// Добавление нового поля контакта при нажатии на кнопку "Добавить контакт"

addContactBtn.addEventListener('click', (event) => {
  event.preventDefault();
  const contactCount = contactsContainer.querySelectorAll('.contact-input').length;


  if (contactCount >= 9) {
    addContactBtn.classList.add('d-none');


  } else {
    contactsContainer.appendChild(createContactInput());
    saveBtn.disabled = !isFormChanged(); // Проверка изменений формы
  }
});


// выводит информацию о невалидном поле
function getErrorMsg(text) {

  const errorMsg = document.createElement('p');
  errorMsg.classList.add('errors__desc');
  errorMsg.textContent = text
  errorsContainer.append(errorMsg)

  return (errorMsg)
}

// Обработка отправки формы для добавления/редактирования клиента
addClientForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const surname = document.getElementById('surname').value.trim(),
    name = document.getElementById('name').value.trim(),
    lastName = document.getElementById('lastName').value.trim(),
    contactInputs = document.querySelectorAll('.contact-input'),
    errors = [],
    contacts = Array.from(contactInputs).map(input => {
      const type = input.querySelector('select').value,
        value = input.querySelector('input').value.trim();
      if (value) { // Только добавляем контакт, если есть значение
        return {
          type,
          value
        };


      }
      if (!value) {
        errors.push('Поле контакты не должно быть пустым!')
      }

    }).filter(contact => contact !== undefined); // Убираем undefined элементы

  if (contacts.length === 0) {
    errors.push('Необходимо заполнить хотя бы один контакт.');
  }

  if (errors.length > 0) {
    errorsContainer.innerHTML = ''; // Очищаем предыдущие ошибки
    errors.forEach(error => {
      errorsContainer.append(getErrorMsg(error));
    });
    return;
  }

  const clientObj = {
    surname,
    name,
    lastName,
    contacts
  };

  // Если форма используется для редактирования клиента
  if (addBtn.dataset.editId) {
    const clientId = addBtn.dataset.editId,
      clientDataObj = await serverEditClient(clientId, clientObj),
      index = clientsArr.findIndex(c => c.id === clientId);
    clientsArr[index] = {
      ...clientsArr[index],
      ...clientDataObj,
      updatedAt: new Date().toISOString()
    };
  } else {
    // Если форма используется для добавления нового клиента
    const clientDataObj = await serverAddClient(clientObj);
    clientsArr.push(clientDataObj);
  }

  modalContainer.classList.add('d-none');
  event.target.reset();
  contactsContainer.innerHTML = ''; // Очистка полей контактов после сохранения

  fetch(serverClientsUrl)
    .then(response => {
      let status = response.status;
      console.log('Status:', status);
      if ('Status:', status === 200 && 'Status:', status === 201) {
        render();
      }

      return response.json();
    })


});

// Открытие формы для добавления нового клиента
addBtn.addEventListener('click', () => {
  modalContainer.classList.remove('d-none');
  modalTitle.innerHTML = 'Новый клиент';
  modalContent.classList.remove('d-none')
  addBtn.dataset.editId = '';
  contactsContainer.innerHTML = ''; // Очистка полей контактов при добавлении нового клиента
  initialFormState = getFormState(); // Установка начального состояния формы
  // saveBtn.disabled = true; // Деактивация кнопки сохранения

  // Добавление кнопки "Отмена"
  buttonContainer.innerHTML = '';
  buttonContainer.appendChild(cancelBtn);
});

// Добавление обработчика на кнопку закрытия формы
cancelAction(closeBtn);


modalContainer.addEventListener('click', (event) => {
  if (event.target === modalContainer) {
    modalContainer.classList.add('d-none');
    addClientForm.reset();
    modalConfirmDelete.innerHTML = '';
    contactsContainer.innerHTML = '';
    errorsContainer.innerHTML = '';
  }
});

// Первоначальное отображение списка клиентов
render();
