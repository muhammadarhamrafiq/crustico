interface ImageUploaderProps {
    name: string,
    value?: File | null,
    onChange?: (file: File) => void
}

const ImageUploader = ({name = 'image', value, onChange} : ImageUploaderProps) => {
    const preview = value ? URL.createObjectURL(value) : null

    const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0]
        if(onChange && file) onChange(file)
    }


    return (
        <div>
            <label htmlFor="file-upload" className="cursor-pointer">
                <div className="w-80 h-90 border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center">
                    {
                        preview ? (
                            <img src={preview} className="w-full h-full object-center object-cover"/>
                        )
                        : (
                            <span className="text-gray-400">Click to upload image</span>
                        )
                    }
                </div>
            </label>
            <input id="file-upload" name={name} type="file" className="hidden" onChange={onUpload} />
        </div>
    )
}

export default ImageUploader