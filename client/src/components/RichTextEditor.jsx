// import React, { useState } from 'react';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

// const RichTextEditor = ({input, setInput}) => {

//     const handleChange = (content) => {
//         setInput({...input, description:content});
//     }
   
//   return <ReactQuill theme="snow" value={input.description} onChange={handleChange} />;
// }
// export default RichTextEditor


import React, { useRef } from 'react'
import JoditEditor from 'jodit-react';
const RichTextEditor = ({input, setInput}) => {
  const editor = useRef(null);
  const handleChange = (content) => {
    setInput({...input, description:content});
}
	// const [content, setContent] = useState('');
  return (
    <div>
      <JoditEditor
			ref={editor}
			value={input.description}
			// config={config}
			tabIndex={1} // tabIndex of textarea
			onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
			onChange={handleChange}
		/>
    </div>
  )
}

export default RichTextEditor
