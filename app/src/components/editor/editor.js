import axios from 'axios';
import React, {Component} from 'react';
import '../../helpers/iframeLoader.js';
import DOMHelper from '../../helpers/dom-helper';
import EditorText from '../editor-text';
import UIKit from 'uikit';
import Spinner from '../spinner';
import ConfirmModal from '../confirm-modal';
import ChooseModal from '../choose-modal';
import Panel from '../panel';
import EditorMeta from '../editor-meta';
import EditorImages from '../editor-images';



export default class Editor extends Component{
constructor(){
    super();
    this.currentPage= 'index.html';

    this.state={
        pageList: [],
        newPageName:'',
        backupsList:[],
        loading: true
    }
    // this.createNewPage= this.createNewPage.bind(this);
    this.isLoading= this.isLoading.bind(this);
    this.isLoaded= this.isLoaded.bind(this);
    this.save= this.save.bind(this);
    this.init= this.init.bind(this);
    this.restoreBackup= this.restoreBackup.bind(this);


}

//life cycle comp for sending data to server after (!) render
componentDidMount(){
    this.init(null, this.currentPage)
}


init(e, page){
    if (e){
        e.preventDefault();
    }
    this.isLoading();
    this.iframe= document.querySelector('iframe');
    this.open(page, this.isLoaded);
    this.loadPageList();
    this.loadBackupsList();
}

//after creating page
open(page, cb){
    this.currentPage= page;

    axios       
        .get(`../${page}?rnd=${Math.random()}`) //get req to server, receive indexed page + against caching
        .then(res=> DOMHelper.parseStrToDOM(res.data)) //clear structure convert to dom structure
        .then(DOMHelper.wrapTextNodes)// RECEIVES RESULT OF PREVIOUS AND USES IN F to wrap in special tag
        .then(DOMHelper.wrapImages)
        .then(dom=> {// save clean copy to virtual
            this.virtualDom= dom;
            return dom;
        })
        .then(DOMHelper.serializeDOMToString) // convert dom to string because cannot send dom to server
        .then(html=> axios.post('./api/saveTempPage.php', {html})) //send received html string to php file
        .then(()=> this.iframe.load('../sondbcoqwubcilbcgl.html')) //load temp to iframe
        .then(()=> axios.post('./api/deleteTempPage.php'))
        .then(()=> this.enableEditing()) // turn on element editing
        .then(()=> this.injectStyles())
        .then(cb)

    this.loadBackupsList();
    
};

async save(){
    this.isLoading();
    const newDOM= this.virtualDom.cloneNode(this.virtualDom);
    DOMHelper.unwrapTextNodes(newDOM);
    DOMHelper.unwrapImages(newDOM);
    const html= DOMHelper.serializeDOMToString(newDOM);
    await axios
        .post("./api/savePage.php", {pageName:  this.currentPage , html })
        .then(()=> this.showNotification('Saved!', 'success'))
        .catch(()=> this.showNotification('Failed :(', 'danger'))
        .finally(this.isLoaded);

    this.loadBackupsList();
}

enableEditing(){
    this.iframe.contentDocument.body.querySelectorAll('text-editor').forEach(element=>{
        
        const id= element.getAttribute('nodeid');
        const virtualElement= this.virtualDom.body.querySelector(`[nodeid="${id}"]`)
        //for every text node
        new EditorText(element, virtualElement)
    });

    this.iframe.contentDocument.body.querySelectorAll('[editableimgid]').forEach(element=>{
        
        const id= element.getAttribute('[editableimgid]');
        const virtualElement= this.virtualDom.body.querySelector(`[editableimgid="${id}"]`)
        //for every img
        new EditorImages(element, virtualElement, this.isLoading, this.isLoaded, this.showNotification)
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
    }
    [editableimgid]:hover{
        outline: 3px solid orange;
        outline-offset: 8px;
    }
    `;

    this.iframe.contentDocument.head.appendChild(style);
}


showNotification(message, status){
    UIKit.notification({message, status});

}



loadPageList(){
    axios
        .get('./api/pageList.php')
        .then(res=> this.setState({pageList: res.data})) //clear data
}

loadBackupsList(){
    axios   
        .get("./backups/backups.json")
        .then(res=> this.setState({backupsList: res.data.filer(backup=> {return backup.page === this.currentPage; })}))
}

// createNewPage(){
//     axios
//         .post('./api/createNewPage.php', {'name': this.state.newPageName})
//         .then(this.loadPageList())
//         .catch(()=> alert('Page already exists'))
// }

// deletePage(page){
//     axios   
//         .post('./api/deletePage.php', {'name': page})
//         .then(this.loadPageList())
//         .catch(()=> alert('Page doesnt exists'));
// }

restoreBackup(e, backup){
    if(e) {
        e.preventDefault();
    }
    UIKit.modal.confirm("Are sure that you want restore?", {labels:{ok: 'Reastore', cancel:'Cancel'}})
    .then(()=>{
        this.isLoading();
        return axios   
            .post('./api/restoreBackup.php', {'page': this.currentPage, 'file': backup})
    })
    .then(()=> {
        this.open(this.currentPage, this.isLoaded);
    })
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
    const {loading, pageList, backupsList}= this.state;
    let spinner;

    loading? spinner=<Spinner active/> : spinner=<Spinner/>

    return(
        

        <>            
            <iframe src='' frameBorder='0'></iframe>

            <input id='img-upload' type='file' accept='image/*' style={{display: 'none'}}></input>
            {spinner}

            <Panel/>
            <ConfirmModal modal={modal} target={'modal-save'} method={this.save}/>
            <ChooseModal modal={modal} target={'modal-open'} data={pageList} redirect={this.init}/>
            <ChooseModal modal={modal} target={'modal-backup'} data={backupsList} redirect={this.restoreBackup}/>
            (this.virtualDom ?   <EditorMeta modal={modal} target={'modal-meta'} virtualDom={this.virtualDom}/> : false)
        </>
    )
}

}