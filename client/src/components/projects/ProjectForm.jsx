import { useState } from 'react';

export default function ProjectForm({values, onChange, onSubmit, errors, submitLabel, disabled}){
    const [localNameError, setLocalNameError] = useState('');
    const nameError = errors?.name || localNameError;
    return (
        <form onSubmit={(e)=>{
            e.preventDefault();

            if(values.name.trim().length<3){
                setLocalNameError("Name must be at least 3 characters");
                return;
            }
            setLocalNameError('');
            onSubmit();
        }}>
            <label htmlFor="project-name"
            className="mb-1 block text-sm font-medium text-ink">Name</label>
            <input 
                type="text" 
                id="project-name" 
                value={values.name} 
                onChange={(e)=>{
                    onChange('name',e.target.value);

                    if(e.target.value.trim().length >=3){
                        setLocalNameError('');
                    }

                }}
                aria-invalid={Boolean(nameError)}
                aria-describedby={nameError ? "project-name-error" : undefined}
                className="w-full rounded-card border border-line bg-canvas px-3 py-2 text-sm text-navy"
            />
            {nameError && (
                <p id="project-name-error" className="mt-1 text-xs text-danger">
                {nameError}
                </p>
            )}
            <label htmlFor="project-description"
            className="mb-1 block text-sm font-medium text-ink"
            >Description</label>
            <textarea
                id="project-description"
                value={values.description}
                onChange={(e) => onChange('description', e.target.value)}
                rows={4}
                className="w-full rounded-card border border-line bg-canvas px-3 py-2 text-sm text-navy resize-y"
            />
            <button
            type="submit"
            disabled={disabled}
            className="mt-2 rounded-card bg-navy px-4 py-2 text-sm font-medium text-surface disabled:cursor-not-allowed disabled:opacity-60">{submitLabel}</button>
        </form>
    );
}