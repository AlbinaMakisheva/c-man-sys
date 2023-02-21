import axios from 'axios';
import React, {Component} from 'react';
import '../../helpers/iframeLoader.js';
import DOMHelper from '../../helpers/dom-helper';
import EditorText from '../editor-text';
import UIKit from 'uikit';
import Spinner from '../spinner';
import ConfirmModal from '../confirm-modal';
import ChooseModal from '../choose-modal';



export default class Editor extends Component{
constructor(){
    super();
    this.currentPage= 'index.html';

    this.state={
        pageList: [],
        newPageName:'',
        loading: true
    }
    this.createNewPage= this.createNewPage.bind(this);
    this.isLoading= this.isLoading.bind(this);
    this.isLoaded= this.isLoaded.bind(this);
    this.save= this.save.bind(this);
    this.init= this.init.bind(this);


}

//life cycle comp for sending data to server after (!) render
componentDidMount(){
    this.init(null, this.currentPage)
}


init(e, page){
    if (e){
        e.preventDefault();
    }
    this.isLoaded();
    this.iframe= document.querySelector('iframe');
    this.open(page, this.isLoaded);
    this.loadPageList();
}

//after creating page
open(page, cb){
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
        .then(()=> this.iframe.load('../sondbcoqwubcilbcgl.html')) //load temp to iframe
        .then(()=> axios.post('./api/deleteTempPage.php'))
        .then(()=> this.enableEditing()) // turn on element editing
        .then(()=> this.injectStyles())
        .then(cb)
    
};

save(onsuccess, onerror){
    this.isLoading();
    const newDOM= this.virtualDOM.cloneNode(this.virtualDOM);
    DOMHelper.unwrapTextNodes(newDOM);
    const html= DOMHelper.serializeDOMToString(newDOM);
    axios
        .post("./api/savePage.php", {pageName:  this.currentPage , html })
        .then(onsuccess)
        .catch(onerror)
        .finally(this.isLoaded);
}

enableEditing(){
    this.iframe.contentDocument.body.querySelectorAll('text-editor').forEach(element=>{
        
        const id= element.getAttribute('nodeid');
        const virtualElement= this.virtualDOM.body.querySelector(`[nodeid="${id}"]`)
        //for every text node
        new EditorText(element, virtualElement)
    });
}

injectStyles(){
    const style= this.iframe.contentDocument.createElement('style');
    style.innerHTML= `
    text-editor:focus{
        outline: 3px solid red;
        outline-offset: 8px;
    }
    text-editor:hover{
        outline: 3px solid orange;
        outline-offset: 8px;
    }`;

    this.iframe.contentDocument.head.appendChild(style);
}




loadPageList(){
    axios
        .get('./api/pageList.php')
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

isLoading(){
    this.setState({
        loading: true
    })
}

isLoaded(){
    this.setState({
        loading: false
    })
}

 render(){
    const modal=true;
    const {loading, pageList}= this.state;
    let spinner;

    loading? spinner=<Spinner active/> : spinner=<Spinner/>

    return(
        

        <>            
            <iframe src={this.currentPage} frameBorder='0'></iframe>

            {spinner}

            <div className= 'panel'> 
                <button className= 'uk-button uk-button-primary uk-margin-small-right' uk-toggle= 'target: #modal-open'>Open</button>
                <button className= 'uk-button uk-button-primary' uk-toggle= 'target: #modal-save'>Ready</button>

            </div>

            <ConfirmModal modal={modal} target={'modal-save'} method={this.save}/>
            <ChooseModal modal={modal} target={'modal-open'} data={pageList} redirect={this.init}/>
        
        </>
    )
}

}