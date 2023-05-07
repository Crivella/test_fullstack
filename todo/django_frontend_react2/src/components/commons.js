export function InputText({ label, required: isRequired=false, onChange = () => {} }) {
    return (
        <div className="form-group col-md-4">
            <label>{label}:</label>
            <input type="text" id={label} className="form-control" onChange={onChange} required={isRequired}/>
            <div className="invalid-feedback">
                Please provide a valid {label}.
            </div>
        </div>
    )
}
    
