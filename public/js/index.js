let btnElement = document.querySelector('.btn');
let fileElement = document.querySelector('#file');
let contentList = document.querySelector('.content-list');
let taskPanel = document.querySelector('.task_panel');
let taskBody = document.querySelector('.task_body');

btnElement.onclick = function () {
    fileElement.click();
}
function showLoadingProgress(){
    let li = document.createElement('li');
    let span = document.createElement('span');
    let taskProgressStatusdiv = document.createElement('div');
    taskProgressStatusdiv.classList.add('task-progress-status');
    let progressDiv = document.createElement('div');
    progressDiv.classList.add('progress');
    progressDiv.style.width = '0%';
    li.appendChild(span);
    li.appendChild(taskProgressStatusdiv);
    li.appendChild(progressDiv);

    taskBody.appendChild(li);
    return {
        taskProgressStatusdiv,
        progressDiv
    }
}
fileElement.onchange = function () {
    let xhr = new XMLHttpRequest();
    xhr.open('post', '/upload', true);
   
    xhr.upload.onload = function () {
        taskPanel.style.display = 'none';
    }

    xhr.upload.onloadstart = function () {
        console.log("progress is starting");
        taskPanel.style.display = 'block';
    }
    const {taskProgressStatusdiv,progressDiv} =  showLoadingProgress();
    xhr.upload.onprogress = function (e) {
        taskPanel.style.display = 'block';
        taskProgressStatusdiv.innerHTML = (e.loaded / e.total).toFixed(2) + '%';
        progressDiv.style.width = (e.loaded / e.total) + '%';
    }
    xhr.onload = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let receivedData = xhr.responseText;
            const data= JSON.parse(receivedData);
            renderSingleImage(data);
        }else{
            let errData = xhr.responseText;
             errData= JSON.parse(errData);
            console.log(errData);
        }
    }
    let fd = new FormData();
    fd.append('upload', fileElement.files[0]);
    xhr.send(fd);
}
//每次上传一张图片，显示一张数据
function renderSingleImage(singleImageData){
    let myImg = document.createElement("img");
    myImg.src ="../static/upload/"+singleImageData.filename;
    document.querySelector(".content-list").appendChild(myImg);
}

// 页面每次重新载入或者刷新的时候，获取所有已经上传的图片，并显示在页面中
// renderData函数，渲染所有从数据库得到的数据。
function renderData(data){
    let myDiv = document.createElement("ul")
    let myLi = document.createElement("li");
    if(data.length!==0){
        data.forEach(photo=>{
        let myImg = document.createElement("img");
        myImg.src ="../static/upload/"+photo.filename;
        myLi.appendChild(myImg);
        myDiv.appendChild(myLi);
        document.querySelector(".content-list").appendChild(myDiv);
        })
    }
}

window.onload = function () {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/getPhotos', true);
    xhr.onload = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let receivedData = xhr.responseText;
            const data= JSON.parse(receivedData);
            renderData(data);   //煊染数据
        }
    }
    xhr.send();
}