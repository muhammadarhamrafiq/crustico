import { Input } from "./ui/input"

interface SearchProps {
    placeholder?: string
    value: string
    onChange: (s: string) => void
}

const Search = (props: SearchProps) => {
    return (
        <Input placeholder={props.placeholder || 'Search...'} value={props.value} onChange={(e) => props.onChange(e.target.value)} className="w-80 max-w-full" />
    )
}

export default Search;