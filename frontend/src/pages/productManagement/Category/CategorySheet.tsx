import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

import type { Category } from "@/types"

interface categorySheetPrompts {
    title: string
    description ?: string
    value?: Category
    onSubmit:  (data: {
        name: string
        description: string
        slug: string
    }) => Promise<boolean>
    children: React.ReactNode
}

const CategorySheet = ({value, onSubmit, title, description: sheetDescription, children}: categorySheetPrompts) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [slug, setSlug] = useState('')
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const onClick = async () => {
        const invalid = name.trim().length < 3 || description.trim().length < 10 || slug.trim().length < 2
        if(invalid) return
        setLoading(true)
        const success = await onSubmit({
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim(),
        })
        setLoading(false)
        if(success) handleClose(false)
    }

    const handleClose = (open: boolean) =>{
        if(!open){
            setName('')
            setDescription('')
            setSlug('')
        } else {
            if(value){
                setName(value.name)
                setDescription(value.description || '')
                setSlug(value.slug)
            }
        }
        setOpen(open)
    }

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetTrigger asChild>
                {
                    children
                }
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    {sheetDescription && <SheetDescription>{sheetDescription}</SheetDescription>}
                </SheetHeader>
                <div className="grid w-full items-center gap-4 py-4 px-4">
                    <Field>
                        <FieldLabel className="sr-only" >name</FieldLabel>
                        <Input 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Enter category name"
                            aria-describedby= { name.trim().length < 3 ? "name-err" : undefined}
                            aria-invalid = {name.trim().length < 3}
                        />
                        {
                            name.trim().length < 3 && <FieldError id="name-err">Name must contain atleast 3 characters.</FieldError>
                        }
                    </Field>
                    <Field>
                        <FieldLabel className="sr-only">slug</FieldLabel>
                        <Input 
                            value={slug}
                            onChange={e => setSlug(e.target.value)}
                            placeholder="Enter slug"
                            aria-describedby={slug.trim().length < 2 ? "slug-input" : undefined}
                            aria-invalid={slug.trim().length < 2}
                        />
                        {
                            slug.trim().length < 2 && <FieldError id="slug-input">Slug must contain atleast 2 chracters.</FieldError>
                        }
                    </Field>
                    <Field>
                        <FieldLabel className="sr-only" >description</FieldLabel>
                        <Textarea 
                            className="h-80 resize-none"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Enter Description"
                            aria-describedby={description.trim().length < 10 ? "description-err" : undefined}
                            aria-invalid={description.trim().length < 10}
                        />
                        {
                            description.trim().length < 10 && <FieldError id="description-err">Description must contain atleast 10 characters.</FieldError>
                        }
                    </Field>

                </div>
                <SheetFooter>
                    <Button className="cursor-pointer" onClick={onClick} disabled={loading}>Submit</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default CategorySheet