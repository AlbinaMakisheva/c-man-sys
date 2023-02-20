import axios from 'axios';
import React, {Component} from 'react';
import '../../helpers/iframeLoader.js';
import DOMHelper from '../../helpers/dom-helper';



export default class Editor extends Component{
constructor(){
    super();
    this.currentPage= 'index.html';

    this.state={
        pageList: [],
        newPageName:''
    }
    this.createNewPage= this.createNewPage.bind(this);
}

//life cycle comp for sending data to server after (!) render
componentDidMount(){
    this.init(this.currentPage)
}


init(page){
    this.iframe= document.querySelector('iframe');
    this.open(page);
    this.loadPageList();
}

//after creating page
open(page){
    this.currentPage= page;

    axios       
        .get(`../${page}?rnd=${Math.random()}`) //get req to server, receive indexed page + against caching
        .then(res=> DOMHelper.parseStrToDOM(res.data)) //clear structure convert to dom structure
        .then(DOMHelper.wrapTextNodes)// RECEIVES RESULT OF PREVIOUS AND USES IN F to wrap in special tag
        .then(dom=> {// save clean copy to virtual
            this.virtualDOM= dom;
            return dom;
        })
        .then(DOMHelper.serializeDOMToString) // convert dom to string because cannot send dom to server
        .then(html=> axios.post('./api/saveTempPage.php', {html})) //send received html string to php file
        .then(()=> this.iframe.load('../temp.html')) //load temp to iframe
        .then(()=> this.enableEditing()) // turn on element editing
    
};

save(){
    const newDOM= this.virtualDOM.cloneNode(this.virtualDOM);
    DOMHelper.unwrapTextNodes(newDOM);
    const html= DOMHelper.serializeDOMToString(newDOM);
    axios
        .post("./api/savePage.php", {pageName:  this.currentPage , html })
}

enableEditing(){
    this.iframe.contentDocument.body.querySelectorAll('text-editor').forEach(element=>{
        element.contentEditable= 'true';
        element.addEventListener('input', ()=>{
            this.onTextEdit(element); //method for sync all changes
        })
    });
}

//for sync of changes
// write the same element in clean copy
onTextEdit(element){
    const id= element.getAttribute('nodeid');
    this.virtualDOM.body.querySelector(`[nodeid="${id}"]`).innerHTML= element.innerHTML;
}



loadPageList(){
    axios
        .get('./api')
        .then(res=> this.setState({pageList: res.data})) //clear data
}

createNewPage(){
    axios
        .post('./api/createNewPage.php', {'name': this.state.newPageName})
        .then(this.loadPageList())
        .catch(()=> alert('Page already exists'))
}

deletePage(page){
    axios   
        .post('./api/deletePage.php', {'name': page})
        .then(this.loadPageList())
        .catch(()=> alert('Page doesnt exists'));
}

 render(){
    // const {pageList}= this.state; //get param from obj
    // const pages= pageList.map((page, i )=> {
    //     return (
    //         <h1 key={i}> {page}
    //             <a href='#' onClick={()=> this.deletePage(page)}>X</a>
    //          </h1>
    //     )
    //  });

    return(
        <>
        <button onClick={()=> this.save()}>Click</button>
        <iframe src={this.currentPage} frameBorder='0'></iframe>
        </>
        // <>
        //     <input onChange={(e)=> {this.setState({newPageName: e.target.value})}} type='text'/>
        //     <button onClick={this.createNewPage}>Create page</button>
        //     {pages}
        // </>
    )
}

}