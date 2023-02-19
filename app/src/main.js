import React from 'react';
import ReactDom from 'react-dom';


ReactDom.render( , document.getElementById('root'))

function getPageList(){
    $("h1").remove();
    $.get("./api", data=>{
        data.forEach(file => {
            $("body").append(`<h1>${file}</h1>`)
        });
    }, "JSON");
};

getPageList();


$('button').onclick(()=>{
    //to send post req + address + data to send
    $.post('./api/createNewPage.php', {
        "name": $('input').val()
    }, ()=> { //result which received from server
        getPageList();
    })
    .fail(()=>{
        alert("Page already exists")
    })
});