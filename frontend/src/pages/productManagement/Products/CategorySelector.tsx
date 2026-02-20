import { Field } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useCategories from "@/hooks/useCategories";

interface CategorySelectorProps {
    value: string,
    onSelect: (id:string) => void
    allowDefault?: boolean
}

const CategorySelector = ({value, onSelect, allowDefault}: CategorySelectorProps) => {
  const { categories } = useCategories();
  return (
    <Field>
      <Select
        value={value}
        onValueChange={onSelect}
      >
        <SelectTrigger>
            <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {allowDefault && <SelectItem value="default">All Categories</SelectItem>}
        {categories.map((category) => (
            <SelectItem value={category.id} key={category.id}>
            {category.name}
          </SelectItem>
        ))}
        </SelectContent>
      </Select>
    </Field>
  );
};

export default CategorySelector;
