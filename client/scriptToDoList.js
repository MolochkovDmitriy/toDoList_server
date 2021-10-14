'use strict'

let tasks = [];

const listOfTasks = document.getElementById('listTask');
const selectFilter = document.getElementById('selectFilter');
const inputTask = document.getElementById('inputTask');
const dropdownBtn = document.getElementById('dropdown-Btn');
const paginator = document.getElementById('paginator');
const btnShowAll = document.getElementById('btnShowAll');
const btnShowCheck = document.getElementById('btnShowCheck');
const btnShowUncheck = document.getElementById('btnShowUncheck');
const btnAddTask = document.getElementById('formBtnAddTask');
const selectColor = document.getElementById('selectChooseColor');
const btnDeleteAllTasks = document.getElementById('btnDeleteAllTasks');
const btnDeleteCheckedTasks = document.getElementById('btnDeleteCheckedTasks');
const modalDeleteAllTasks = document.getElementById('modalDeleteAllTasks');
const modalDeleteCheckedTasks = document.getElementById('modalDeleteCheckedTasks');
const modalBtnDeleteAllTasks = document.getElementById('modalBtnDeleteAllTasks');
const modalBtnDeleteCheckedTasks = document.getElementById('modalBtnDeleteCheckedTasks');

let pageCount = 0;
let page = 1;
let flagChecked = false;
let flagUnchecked = false;
let colorOfTask = 'black';

let countAllTask = 0;
let countCompletedTask = 0;
let countUncompletedTask = 0;

dropdownBtn.style.color = 'white';
btnShowAll.classList.add('active');

const pageTask = 5;
const colorSet = [
	{ eng: 'black', rus: 'Чёрный' },
	{ eng: 'red', rus: 'Красный' },
	{ eng: 'blue', rus: 'Синий' },
	{ eng: 'green', rus: 'Зелёный' },
	{ eng: 'purple', rus: 'Фиолетовый' },
]

document.addEventListener("load", showTaskList(1))

function DBtoArray(data) {
	tasks = [];
	data.forEach((item) => {
		tasks.push({ id: item.id, task: item.content, flag: item.completed, color: item.color });

	})
}

function addCountOfTask(data) {
	countAllTask = data.countAll;
	countCompletedTask = data.countCompleted;
	countUncompletedTask = data.countUncompleted;
}

initializationDropdownBtnColor()

function initializationDropdownBtnColor() {
	selectColor.innerHTML = '';
	let dropdownSet = '';
	for (let i = 0; i < colorSet.length; i++) {
		dropdownSet += `<li><a class="dropdown-item" href="#" data-color="${colorSet[i].eng}">${colorSet[i].rus}</a></li>`
	}
	selectColor.insertAdjacentHTML('beforeend', dropdownSet);
}

function changeColorOfTask(currentColor, idTask) {
	let elementNumber = tasks.findIndex(item => item.id == idTask);
	let newColor = colorSet.findIndex(item => item.eng === currentColor) + 1;

	tasks[elementNumber].color = ((newColor < colorSet.length) &&
		(newColor !== 0)) ? colorSet[newColor].eng : tasks[elementNumber].color = colorSet[0].eng;

	let data = { color: tasks[elementNumber].color }
	fetch("/task/updateone?id=" + idTask,
		{
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(showTaskList(page));
}

function chooseColorOfTask(color) {
	colorOfTask = color;
	dropdownBtn.style.color = color;
}

selectColor.addEventListener('click', function (e) {
	if (e.target.tagName === 'A') {
		chooseColorOfTask(e.target.dataset.color);
	}
})

selectFilter.addEventListener('click', function (e) {
	let id = e.target.closest('BUTTON').id;
	filter(id);
})

listOfTasks.addEventListener('click', function (e) {
	if ((e.target.tagName === 'LI') || (e.target.tagName === 'STRIKE')) {
		let id = e.target.closest('LI').id;
		let checkedTask = tasks.findIndex(item => item.id == id);
		let data = { completed: !tasks[checkedTask].flag }
		fetch("/task/updateone?id=" + id,
			{
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json'
				}
			}).then(showTaskList(page));
	}
	let targetButton = e.target.closest('BUTTON');
	if (targetButton !== null) {
		if (targetButton.className.includes('js-changeColor')) {
			changeColorOfTask(targetButton.dataset.color, targetButton.dataset.idTask);
		}

		if (targetButton.className.includes('js-editTask')) {
			editTask(targetButton.dataset.idTask);
		}

		if (targetButton.className.includes('js-deleteOneTask')) {
			deleteOneTask(targetButton.dataset.idTask);
		}
	}
})

paginator.addEventListener('click', function (e) {
	if (((e.target.tagName === 'LI') || (e.target.tagName === 'A') || (e.target.tagName === 'SPAN'))
		&& (e.target.closest('LI').className !== 'page-item disabled') && (e.target.closest('A').id !== null)) {
		switch (e.target.closest('A').id) {
			case 'previous':
				previousPage(Number(e.target.closest('A').dataset.pageCount));
				break;
			case 'first':
				showTaskList(1);
				break;
			case 'next':
				nextPage(Number(e.target.closest('A').dataset.pageCount));
				break;
			case 'last':
				showTaskList(Number(e.target.closest('A').dataset.pageCount));
				break;
		}
	}
})

btnAddTask.addEventListener('click', function (e) {
	e.preventDefault();
	getNewItem();
	if (!flagUnchecked) {
		pageCount = (Math.ceil(countAllTask / pageTask) > 0) ? Math.ceil(countAllTask / pageTask) : 1;
		filter('btnShowAll', pageCount);
	} else {
		pageCount = (Math.ceil(countUncompletedTask / pageTask) > 0) ? Math.ceil(countAllTask / pageTask) : 1;
		filter('btnShowUncheck', pageCount);
	}
})

btnDeleteAllTasks.addEventListener('click', function () {
	if (countAllTask !== 0) {
		let modal = new bootstrap.Modal(modalDeleteAllTasks);
		modal.show()
	}
})

btnDeleteCheckedTasks.addEventListener('click', function () {
	if (countCompletedTask !== 0) {
		let modal = new bootstrap.Modal(modalDeleteCheckedTasks);
		modal.show()
	}
})

modalBtnDeleteAllTasks.addEventListener('click', deleteTaskAll);

modalBtnDeleteCheckedTasks.addEventListener('click', deleteTaskChecked);

function deleteTaskChecked() {
	clearTaskListChecked();
	if (!flagChecked && !flagUnchecked) {
		if (pageCount < page) {
			showTaskList(pageCount)
		} else {
			showTaskList(page)
		}
	} else if (flagUnchecked) {
		showTaskList(page);
	} else if (flagChecked) {
		showTaskList(1);
	}
}

function deleteTaskAll() {
	clearTaskListAll();
	showTaskList(1);
}

function escapeHtml(unsafe) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function getNewItem() {
	if (inputTask.value !== '') {
		inputTask.value = escapeHtml(inputTask.value);

		let data = { content: inputTask.value, color: colorOfTask }
		fetch("/task",
			{
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json'
				}
			});

		inputTask.value = '';
		colorOfTask = 'black';
		dropdownBtn.style.color = 'white';
	}
}

function renderPagination(page, countTask) {
	paginator.innerHTML = '';
	let paginatorData = '';
	pageCount = Math.ceil(countTask / pageTask);
	if (countTask > pageTask) {
		switch (page) {
			case 1:
				paginatorData =
					`<li class="page-item disabled"><a class="page-link">
                <span aria-hidden="true">&laquo;</span></a></li>
                <li class="page-item active"><a class="page-link">1</a></li>
                <li class="page-item"><a class="page-link">..</a></li>
                <li class="page-item"><a class="page-link" id="last" data-page-count="${pageCount}">${pageCount}</a></li> 
                <li class="page-item"><a class="page-link" id="next" data-page-count="${pageCount}">
                <span aria-hidden="true">&raquo;</span></a></li>`;
				break;
			case pageCount:
				paginatorData =
					`<li class="page-item"><a class="page-link" id="previous" data-page-count="${pageCount}">
                <span aria-hidden="true">&laquo;</span></a></li>
                <li class="page-item"><a class="page-link" id="first">1</a></li>
                <li class="page-item"><a class="page-link">..</a></li>
                <li class="page-item active"><a class="page-link">${pageCount}</a></li>
                <li class="page-item disabled"><a class="page-link"><span aria-hidden="true">&raquo;</span></a></li>`
				break;
			default:
				paginatorData =
					`<li class="page-item"><a class="page-link" id="previous" data-page-count="${pageCount}">
                <span aria-hidden="true">&laquo;</span></a></li>
                <li class="page-item"><a class="page-link" id="first">1</a></li>
                <li class="page-item active"><a class="page-link">${page}</a></li>
                <li class="page-item"><a class="page-link" id="last" data-page-count="${pageCount}">${pageCount}</a></li>
                <li class="page-item"><a class="page-link" id="next" data-page-count="${pageCount}">
                <span aria-hidden="true">&raquo;</span></a></li>`;
				break;
		}
	} else {
		paginatorData = `<li class="page-item disabled">
                <a class="page-link" aria-disabled="true"><span aria-hidden="true">&laquo;</span></a></li>
                <li class="page-item active"><a class="page-link">1</a></li>
                <li class="page-item disabled"><a class="page-link"><span aria-hidden="true">&raquo;</span></a></li>`;
	}
	paginator.insertAdjacentHTML('beforeend', paginatorData);
}

function nextPage(totalPage) {
	page = (page < totalPage) ? page + 1 : totalPage;
	showTaskList(page);
}

function previousPage(totalPage) {
	page = ((page > 1) || (page === totalPage)) ? page - 1 : totalPage;
	showTaskList(page);
}

function showTaskList(currentPage) {
	listOfTasks.innerHTML = '';

	page = currentPage;

	let taskSet = '';

	let reqTask = '';

	let totalPage = 1;
	fetch('task/count').then(res => res.json()).then(data => addCountOfTask(data)).then(() => {
		switch (true) {
			case flagChecked:
				reqTask = '/task/completed?page=' + page;
				totalPage = countCompletedTask;
				break;
			case flagUnchecked:
				reqTask = '/task/uncompleted?page=' + page;
				totalPage = countUncompletedTask;
				break;
			default:
				reqTask = '/task/all?page=' + page;
				totalPage = countAllTask;
				break;
		}
	}).then(()=> {
		fetch(reqTask).then(res => res.json()).then(data => DBtoArray(data.rows)).then(() => {
			renderPagination(currentPage, totalPage);
			if (pageCount < page && totalPage !== 0) currentPage = pageCount;
	
			for (let i = 0; i < tasks.length; i++) {
				if (tasks[i].flag === true) {
					taskSet += `<div class="row mt-2 justify-content-between"><div class="col-12 col-lg-7 col-xl-8 text-end"><li class="list-group-item text-start" id=
					${tasks[i].id} style="color:${tasks[i].color}"><strike>${i + page * tasks.length - tasks.length + 1}. ${tasks[i].task}</strike></li></div>`;
				} else {
					taskSet += `<div class="row mt-2 justify-content-between"><div class="col-12 col-lg-7 col-xl-8 text-end"><li class="list-group-item text-start" id=
					${tasks[i].id} style="color:${tasks[i].color}">${i + page * tasks.length - tasks.length + 1}. ${tasks[i].task}</li></div>`;
				}
				taskSet +=
					`<div class="col-1 my-3 my-lg-0">
					<button type="button" data-id-task="${tasks[i].id}" data-color="${tasks[i].color}" class="btn btn-primary js-changeColor">
					<i class="bi bi-palette"></i></button></div>
					<div class="col-11 my-3 col-lg-4 my-lg-0 col-xl-3 text-end"><div class="btn-group" role="group"><button type="button" data-id-task="${tasks[i].id}" 
					class="btn btn-outline-primary js-editTask">
					<i class="bi bi-pencil"></i>
					Редактировать</button>
					<button type="button" data-id-task="${tasks[i].id}" 
					class="btn btn-outline-primary js-deleteOneTask">
					<i class="bi bi-trash"></i> Удалить</button></div></div></div>`;
			}
	
			listOfTasks.insertAdjacentHTML('beforeend', taskSet);
	
			btnShowAll.textContent = 'Показать все (' + countAllTask + ')';
			btnShowCheck.textContent = 'Выполненные (' + countCompletedTask + ')';
			btnShowUncheck.textContent = 'Невыполненные (' + countUncompletedTask + ')';
		})
	})	
}

function clearTaskListChecked() {
	fetch("/task/deletechecked",
		{
			method: 'DELETE',
		})
}

function clearTaskListAll() {
	fetch("/task/deleteall",
		{
			method: 'DELETE',
		}).then(() => {
			tasks.length = 0;

			listOfTasks.innerHTML = "";
		})

}

function filter(id, innerPage) {
	btnShowCheck.classList.remove('active');
	btnShowUncheck.classList.remove('active');
	btnShowAll.classList.remove('active');

	flagChecked = false;
	flagUnchecked = false;
	let outerPage = 1;
	if (innerPage !== undefined) outerPage = innerPage;

	switch (id) {
		case btnShowAll.id:
			btnShowAll.classList.add('active');
			showTaskList(outerPage);
			break;
		case btnShowCheck.id:
			btnShowCheck.classList.add('active');
			flagChecked = true;
			showTaskList(outerPage);
			break;
		case btnShowUncheck.id:
			btnShowUncheck.classList.add('active');
			flagUnchecked = true;
			showTaskList(outerPage);
			break;
	}
}

function editTask(idTask) {
	let editableTask = document.getElementById(idTask);

	let position = editableTask.textContent.indexOf(".") + 2;

	let editStr = editableTask.textContent.slice(position);

	if (editableTask.outerHTML) {
		editableTask.outerHTML = `<input type="text" id="inputEditTask" class="form-control" value="${editStr}"></input>`;
		let inputEditTask = document.getElementById('inputEditTask');
		setTimeout(function () { inputEditTask.selectionStart = inputEditTask.selectionEnd = 10000; }, 0);
		inputEditTask.focus();
		inputEditTask.addEventListener("keyup", function (e) {
			if (e.code === 'Enter') {
				if (inputEditTask.value !== '') {
					let data = { content: inputEditTask.value }
					fetch("/task/updateone?id=" + idTask,
						{
							method: 'POST',
							body: JSON.stringify(data),
							headers: {
								'Content-Type': 'application/json'
							}
						});
				}
				showTaskList(page);
			}
		});
		inputEditTask.addEventListener("focusout", function () {
			if (inputEditTask.value !== '') {
				let data = { content: inputEditTask.value }
				fetch("/task/updateone?id=" + idTask,
					{
						method: 'POST',
						body: JSON.stringify(data),
						headers: {
							'Content-Type': 'application/json'
						}
					});
			}
			showTaskList(page);
		});
	}
}

function deleteOneTask(idTask) {
	fetch("/task/deleteone?id=" + idTask,
		{
			method: 'DELETE',
		}).then(() => {
			if (pageCount < page) {
				showTaskList(pageCount)
			} else {
				showTaskList(page)
			}
		})
}
