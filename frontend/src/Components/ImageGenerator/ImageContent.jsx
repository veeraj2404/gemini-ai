
import React, { useState } from 'react'
import { getImageContent } from './ImageContentService';



export default function ImageContent() {

    const [file, setFile] = useState("")
    const [prompt, setPrompt] = useState("")
    const [result, setResult] = useState("")
    const [subtmitting, setSubmitting] = useState(false)
    const [generating, setGenerating] = useState(false)

    const handleChange   = (e) => {
        e.preventDefault();
        const name = e.target.name;
        
        if (name === "image") {
            setFile(e.target.files[0]);
        } else if (name === "text"){
            setPrompt(e.target.value)
        }
    };

    const generateContent = async (e) => {
        e.preventDefault();
        setSubmitting(true)
        setGenerating(false)

        try {
            const response = await getImageContent(prompt, file); // Wait for API response
            setResult(response); // Update result state after receiving data
        } catch (error) {
            console.error('Error generating text:', error);
            setResult('Failed to generate text.');
        } finally {
            setGenerating(true); // Set generating to true after process completes
        }
    };

    return (
        <div className="container">

            <h1 className="my-4">Image Content</h1>
            <form>
                <div className="mb-3">
                    <label htmlFor="formFile" className="form-label"><b>Upload an Image</b></label>
                    <input onChange={handleChange} type="file" className="form-control" id="formFile" accept="image/*" name="image"/>
                </div>
                <div className="mb-3">
                    <label htmlFor="exampleInputEmail1" className="form-label"><b>Enter your prompt</b></label>
                    <input onChange={handleChange} type="text" className="form-control" id="prompt" aria-describedby="emailHelp" name="text"/>
                    <div className="form-text">We'll fetch the content of uploaded image from gemini-ai.</div>
                </div>
                <button id="submitbtn" type="submit" onClick={generateContent} className="btn btn-primary">Submit</button>
            </form>

            {
                !subtmitting ? null : (
                    !generating ? "Generating..." : <div className="result my-4">
                        <div className="input-group" style={{ height: "200px" }}>
                            <span className="input-group-text">Result</span>
                            <textarea className="form-control" value={result} readOnly aria-label="With textarea"></textarea>
                        </div>
                    </div>
                )
            }

        </div>
    )
}
