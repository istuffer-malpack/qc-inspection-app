//modal function
document.addEventListener('DOMContentLoaded', () => {
 
  function openModal($el) {
    $el.classList.add('is-active');
  }

  function closeModal($el) {
    $el.classList.remove('is-active');
  }

  function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  
  (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);
    //console.log($target);

    $trigger.addEventListener('click', () => {
      openModal($target);
    });
  });

  
  (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => { 
    
	const $target = $close.closest('.modal');
	if(!$close.classList.contains('disabled-escape')){
		$close.addEventListener('click', () => {
		  closeModal($target);
		});
		
	}
    
  });

  
  document.addEventListener('keydown', (event) => {
    const e = event || window.event;

    if (e.keyCode === 27) { 
      //closeAllModals();
    }
  });
});

function openTab(evt, tabName) {
  var i, x, tablinks;
  x = document.getElementsByClassName("content-tab");
  for (i = 0; i < x.length; i++) {
      x[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tab");
  for (i = 0; i < x.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" is-active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " is-active";
}

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}

function addFlag(ele){
	var temp = $('.tab.is-active a').text().toLowerCase().replace(' ','');
	const form = document.getElementById('form');
	form.setAttribute('data-file',ele);
	document.getElementById('uploadfile').value = '';
}

function remove(elem) {
  elem.parentNode.remove();
}

function uploadFile(){
	document.getElementById('submit').classList.add('is-loading');
	var temp = $('.tab.is-active a').text().toLowerCase().replace(' ','');	
	const form = document.getElementById('form');
	var ele = form.getAttribute('data-file');	
	var urlFiles = (ele == 'joUpload') ? 'jobOrderFiles' : 'testFiles';
	const file = form.file.files[0];
	
	 
	  const fr = new FileReader();
	  fr.readAsArrayBuffer(file);
	  fr.onload = f => {
		
		const url = "https://script.google.com/macros/s/AKfycby4kGJH-9kHlY5U9x3qDCdHrxn_yGbRMcukAC7Js6V6FikaOn_J/exec";
		
		const qs = new URLSearchParams({filename: form.filename.value || file.name, mimeType: file.type});
		fetch(`${url}?${qs}`, {method: "POST", body: JSON.stringify([...new Int8Array(f.target.result)])})
		.then(res => res.json())
		.then(
			e => {
					document.querySelector('.'+temp+' .'+ele).innerHTML += '<p>'+e.filename+'<span class="delete" onclick="remove(this)">X</span></p>';
					document.querySelector('.'+temp+' .'+urlFiles).value += e.fileUrl+',';					
					document.getElementById('submit').classList.remove('is-loading');
					document.getElementById('uploadFileModal').classList.remove('is-active');
			}
			
		)
		.catch(err => console.log(err));
	  }
	

}
	
	
	

