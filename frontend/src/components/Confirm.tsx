import { Button } from "./ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "./ui/dialog"

interface ConfirmProps {
    heading?: string,
    message: string,
    onConfirm: () => void,
    children: React.ReactElement,
}

const Confirm = ({message, onConfirm, heading, children}: ConfirmProps) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                { children }
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>{heading}</DialogHeader>
                <DialogDescription>{message}</DialogDescription>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button className="cursor-pointer" variant="ghost" >Close</Button>
                    </DialogClose>
                    <Button className="cursor-pointer" onClick={onConfirm}>Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default Confirm