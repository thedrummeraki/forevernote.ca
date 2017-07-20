function formatDate(date) {
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;

	return [year, month, day].join('-');
}

var activeCourseId = "";
var activeNoteId = "";
// var courseArray = {};
var courseArray = {
	"networkingClass":{name: "Networking", code: "CEG3585", notes: {
		"firstLecture":{
			content: "Alright class, let's talk about asynchronous transmission",
			name: "Lecture 1",
			subject: "Asynchronous transmission",
			date: "2017-09-09"
			// date: formatDate(Date.now())
		},
		"secondLecture":{
			content: "Alright class, let's talk about synchronous transmission!",
			name: "Lecture 2",
			subject: "Synchronous transmission",
			date: "2017-09-10"
			// date: formatDate(Date.now())
		}
	}},
	"interfaceClass":{name: "Interface Design", code: "CEG3585", notes: {
		"firstDayOfClass":{
			content: "Use proper colors!",
			name: "First day of class",
			subject: "Using colors properly",
			date: "2017-11-11"
			// date: formatDate(Date.now())
		}
	}}
};

var idOfNoteToDelete;
var idOfCourseToDelete;

function guidGenerator() {
	var S4 = function() {
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	};
	return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function setCourseActive(element){
	if(activeNoteId && activeNoteId !== ""){
		if(document.getElementById("save-auto").checked){
			saveNoteContentNoPrompt();
		}
		else if (!confirm("By changing the selected course, you will lose any unsaved progress on your current note. Do you wish to proceed?")){
			return false;
		}
	}
	var srcElementId = element.id;
	if(srcElementId) {
		if(activeCourseId){
			document.getElementById(activeCourseId).classList.remove("active");
		}

		document.getElementById(srcElementId).classList.add("active");
		activeCourseId = srcElementId;
		activeNoteId = "";
		document.getElementById("notes-side-nav").innerHTML = "";
		document.getElementById("note-title").innerHTML = "";
		$('#editor-container > .ql-editor').empty();
		document.getElementById("editor").style.display = "none";
		document.getElementById("notes-side-nav").innerHTML += '<li class="collection-header"><h6 id="course-header">Notes</h6><i data-target="create-note-modal" class="fa fa-plus secondary-content header-icon" aria-hidden="true"></i></li>';
		for (var note in courseArray[srcElementId].notes) {
			// Code below inserts the html for each note belonging to the course into the side menu
			document.getElementById("notes-side-nav").innerHTML += '<a onclick="setNoteActive(this)" id="' +
				note +
				'" class="collection-item avatar list-item"><span class="title notetaking-title">' +
				courseArray[srcElementId].notes[note].name +
				'</span><p class="note-date">' +
				courseArray[srcElementId].notes[note].date +
				'</p><p class="note-subject">' +
				courseArray[srcElementId].notes[note].subject +
				'</p><i data-jq-dropdown="#note-dropdown" onclick="prepareNoteDeletion(\''+note+'\')" class="fa fa-ellipsis-v secondary-content collection-icon"></i></a>';
		}
		document.getElementById("notes-side-nav").style.display = "block";
	}
}

function setNoteActive(element){
	if(activeNoteId && activeNoteId !== ""){
		if(document.getElementById("save-auto").checked){
			saveNoteContentNoPrompt();
		}
		else if (!confirm("By changing the selected course, you will lose any unsaved progress on your current note. Do you wish to proceed?")){
			return false;
		}
	}

	var srcElementId = element.id;
	if(srcElementId){
		if (activeNoteId !== ""){
			document.getElementById(activeNoteId).classList.remove("active");
		}
		document.getElementById(srcElementId).classList.add("active");
		activeNoteId = srcElementId;
		document.getElementById("editor").style.display = "block";
		$('#editor-container > .ql-editor').html(courseArray[activeCourseId].notes[activeNoteId].content);
		// right now title doesn't work so this part here shouldn't matter
		document.getElementById("note-title").innerHTML = courseArray[activeCourseId].notes[activeNoteId].name;
	}
}

function saveNoteContent(){
	var newContent = $('#editor-container > .ql-editor').html();
	courseArray[activeCourseId].notes[activeNoteId].content = newContent;
	Materialize.toast('Note saved successfully!', 4000, 'success-toast');
}

function saveNoteContentNoPrompt(){
	var newContent = $('#editor-container > .ql-editor').html();
	courseArray[activeCourseId].notes[activeNoteId].content = newContent;
}

function eraseNewCourseFields(){
	document.getElementById("new-course-code").value = "";
	document.getElementById("new-course-name").value ="";
	document.getElementById("new-course-professor").value = "";
	document.getElementById("new-course-start-date").value = "";
	document.getElementById("new-course-end-date").value = "";
}

function createNewCourse(){
	var newCourseCode = document.getElementById("new-course-code").value;
	var newCourseName = document.getElementById("new-course-name").value;

	if(!newCourseCode.trim()){
		document.getElementById("new-course-code").classList.add("invalid");
	}

	if(!newCourseName.trim()){
		document.getElementById("new-course-name").classList.add("invalid");
	}

	if(!newCourseName.trim() || !newCourseCode.trim()){
		return false;
	}

	document.getElementById("new-course-code").value = "";
	document.getElementById("new-course-name").value ="";
	var newCourseProfessor = document.getElementById("new-course-professor").value;
	document.getElementById("new-course-professor").value = "";
	var newCourseStartDate = document.getElementById("new-course-start-date").value;
	document.getElementById("new-course-start-date").value = "";
	var newCourseEndDate = document.getElementById("new-course-end-date").value;
	document.getElementById("new-course-end-date").value = "";
	var newCourseId = guidGenerator();
	courseArray[newCourseId] ={
		name: newCourseName, code: newCourseCode, prof: newCourseProfessor, startDate: newCourseStartDate, endDate: newCourseEndDate, notes: {}
	};

	document.getElementById("course-side-nav").innerHTML += '<a onclick="setCourseActive(this)" id="'+
		newCourseId +
		'" class="collection-item avatar list-item"><span class="title course-code">'+
		newCourseCode +
		'</span><p class="course-title">' +
		newCourseName +
		'</p><i class="fa fa-ellipsis-v secondary-content collection-icon" data-jq-dropdown="#course-dropdown" '+
		' onclick="prepareCourseDeletion(\''+newCourseId+'\')" aria-hidden="true"></i></a>';
	Materialize.toast('Created course successfully!', 4000, 'success-toast');
	setCourseActive(document.getElementById(newCourseId));
	$('#create-course-modal').modal('close');
}

function eraseNewNoteFields(){
	document.getElementById("new-note-name").value = "";
	document.getElementById("new-note-subject").value = "";
}

function createNewNote(){
	var newNoteName = document.getElementById("new-note-name").value;
	var newNoteSubject = document.getElementById("new-note-subject").value;

	if(newNoteName === "" || !newNoteName){
		document.getElementById("new-note-name").classList.add("invalid");
	}

	if(newNoteSubject === "" || !newNoteSubject){
		document.getElementById("new-note-subject").classList.add("invalid");
	}

	if(newNoteName === "" || !newNoteName || newNoteSubject === "" || !newNoteSubject){
		return false;
	}

	document.getElementById("new-note-name").value = "";
	document.getElementById("new-note-subject").value = "";

	var newNoteId = guidGenerator();
	var newNoteDate = formatDate(Date.now());
	courseArray[activeCourseId].notes[newNoteId] = {
		content: "",
		name: newNoteName,
		subject: newNoteSubject,
		date: newNoteDate
	};

	document.getElementById("notes-side-nav").innerHTML += '<a onclick="setNoteActive(this)" id="' +
		newNoteId +
		'" class="collection-item avatar list-item"><span class="title notetaking-title">' +
		newNoteName +
		'</span><p class="note-date">' +
		newNoteDate +
		'</p><p class="note-subject">' +
		newNoteSubject +
		'</p><i data-jq-dropdown="#note-dropdown" onclick="prepareNoteDeletion(\''+newNoteId+'\')" class="fa fa-ellipsis-v secondary-content collection-icon"></i></a>';

	$('#create-note-modal').modal('close');
	Materialize.toast('Created note successfully!', 4000, 'success-toast');
	setNoteActive(document.getElementById(newNoteId));
}

function prepareNoteDeletion(idToMaybeDelete){
	idOfNoteToDelete = idToMaybeDelete;

	document.getElementById("edit-note-name").value = courseArray[activeCourseId].notes[idToMaybeDelete].name;
	document.getElementById("edit-note-subject").value = courseArray[activeCourseId].notes[idToMaybeDelete].subject;
}

function prepareCourseDeletion(idToMaybeDelete){
	idOfCourseToDelete = idToMaybeDelete;

	document.getElementById("edit-course-code").value = courseArray[idToMaybeDelete].code;
	document.getElementById("edit-course-name").value = courseArray[idToMaybeDelete].name;
	document.getElementById("edit-course-professor").value = courseArray[idToMaybeDelete].prof;
	document.getElementById("edit-course-start-date").value = courseArray[idToMaybeDelete].startDate;
	document.getElementById("edit-course-end-date").value = courseArray[idToMaybeDelete].endDate;
}

function deleteNote(){
	delete courseArray[activeCourseId].notes[idOfNoteToDelete];
	document.getElementById(idOfNoteToDelete).remove();
	document.getElementById("note-title").value = "";
	$('#editor-container > .ql-editor').empty();
	document.getElementById("editor").style.display = "none";
	activeNoteId = "";
	idOfNoteToDelete = "";
	Materialize.toast('Note deleted successfully!', 4000, 'delete-toast');
}

function deleteCourse(){
	if(idOfCourseToDelete === activeCourseId){
		document.getElementById("note-title").value = "";
		$('#editor-container > .ql-editor').empty();
		document.getElementById("editor").style.display = "none";
		document.getElementById("notes-side-nav").innerHTML = "";
		document.getElementById("notes-side-nav").style.display = "none";
		activeNoteId = "";
		activeCourseId = "";
	}
	delete courseArray[idOfCourseToDelete];
	document.getElementById(idOfCourseToDelete).remove();

	idOfCourseToDelete = "";
	Materialize.toast('Note deleted successfully!', 4000, 'delete-toast');
}

function editSelectedNote(){
	courseArray[activeCourseId].notes[idOfNoteToDelete].name = document.getElementById("edit-note-name").value;
	courseArray[activeCourseId].notes[idOfNoteToDelete].subject = document.getElementById("edit-note-subject").value;

	$("#"+idOfNoteToDelete+" > .notetaking-title").html(courseArray[activeCourseId].notes[idOfNoteToDelete].name);
	$("#"+idOfNoteToDelete+" > .note-subject").html(courseArray[activeCourseId].notes[idOfNoteToDelete].subject);
	Materialize.toast('Note edited successfully!', 4000, 'success-toast');
}

function editSelectedCourse(){
	courseArray[idOfCourseToDelete].code = document.getElementById("edit-course-code").value;
	courseArray[idOfCourseToDelete].name = document.getElementById("edit-course-name").value;
	courseArray[idOfCourseToDelete].prof = document.getElementById("edit-course-professor").value;
	courseArray[idOfCourseToDelete].startDate = document.getElementById("edit-course-start-date").value;
	courseArray[idOfCourseToDelete].endDate = document.getElementById("edit-course-end-date").value;
	$("#"+idOfCourseToDelete+" > .course-code").html(courseArray[idOfCourseToDelete].code);
	$("#"+idOfCourseToDelete+" > .course-title").html(courseArray[idOfCourseToDelete].name);
	Materialize.toast('Course edited successfully!', 4000, 'success-toast');
}