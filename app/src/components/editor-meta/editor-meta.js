import React, {Component} from 'react';

export default class EditorMeta extends Component{
    constructor(props){
        super(props);
        this.state={
            meta: {
                title:'',
                keywords:'',
                description:'' 
            }
        }
    }
    componentDidMount(){
        this.getMeta(this.props.virtualDom)
    }

    componentDidUpdate(prevProps){
        if(this.props.vitualDom !== prevProps.virtualDom){
            this.getMeta(this.props.vitualDom )
        }
    }

    getMeta(virtualDOM){
        this.title= virtualDOM.head.querySelector('title') || virtualDOM.head.appendChild(virtualDom.createElement('title'));
        this.keywords= virtualDOM.head.querySelector('meta[name="keywords"]');
        this.description= virtualDOM.head.querySelector('meta[name="description"]');

        if(!this.keywords){
            this.keywords= virtualDOM.head.appendChild(virtualDom.createElement('meta'));
            this.keywords.setAtttibute("name", "keywords");
            this.keywords.setAtttibute("content", "");

        }

        if(!this.description){
            this.description= virtualDOM.head.appendChild(virtualDom.createElement('meta'));
            this.description.setAtttibute("name", "description");
            this.description.setAtttibute("content", "");

        }

        this.setState({
            meta:{
                title: this.title.innerHTML,
                keywords: this.keywords.getAttribute('content'),
                description: this.description.getAttribute('content'),
            }
        })
    }


    allpyMeta(){
        this.title.innerHTML= this.state.meta.title;
        this.keywords.setAttribute('content', this.state.meta.keywords);
        this.description.setAttribute('content', this.state.meta.description)

    }
    
    onValueChange(e){
        if(e.target.getAttribute("data-title")){
            e.persist();
            //turn off async and mutation
            this.setState(({meta})=>{
                const newMeta={
                    ...meta,
                    title: e.target.value
                }
                return {
                    meta: newMeta
                }
            })
        } else if(e.target.getAttribute("data-key")){
            e.persist();
            //turn off async and mutation
            this.setState(({meta})=>{
                const newMeta={
                    ...meta,
                    keywords:e.target.value
                }
                return {
                    meta: newMeta
                }
            })}
            else{
                e.persist();
                //turn off async and mutation
                this.setState(({meta})=>{
                    const newMeta={
                        ...meta,
                        description: e.target.value
                    }
                    return {
                        meta: newMeta
                    }
            })

    }}


    render(){
        const {modal, target}= this.props;
        const {title, keywords, description}= this.state.meta;

        return (
            <div id={target} uk-modal={modal.toString()}>
                <div className="uk-modal-dialog uk-modal-body">
                <h2 className="uk-modal-title">Editing meta-tags</h2>

                <form>
                    <div className="uk-margin" >
                        <input data-title className="uk-input" type="text" placeholder="Title" value={title} onChange={()=> this.onValueChange(e)}></input>
                    </div>
                    <div className="uk-margin" >
                        <textarea data-key className="uk-textarea" rows="5" placeholder="Keywords" value={keywords} onChange={()=> this.onValueChange(e)}></textarea>
                    </div>
                    <div className="uk-margin" >
                        <textarea data-description className="uk-textarea" rows="5" placeholder="Description" value={description} onChange={()=> this.onValueChange(e)}></textarea>
                    </div>
                </form>

                <p className="uk-text-right">
                <button className="uk-button uk-button-default uk-margin-small-right uk-modal-close" type="button">Cancel</button>
                <button className="uk-button uk-button-primary uk-modal-close" type="button" 
                    onClick={()=> this.allpyMeta()}>Save</button>
                </p>
                </div>
             </div>
             
        )
    }
}
