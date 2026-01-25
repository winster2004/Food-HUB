import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import React, { FormEvent, useState, useEffect } from "react";
import { useOptionStore } from "@/store/useOptionStore";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface OptionForm {
    name: string;
    price: number;
    isRequired: boolean;
}

interface OptionManagementProps {
    menuItem: any;
    onBack: () => void;
}

const OptionManagement: React.FC<OptionManagementProps> = ({
    menuItem,
    onBack,
}) => {
    const [input, setInput] = useState<OptionForm>({
        name: "",
        price: 0,
        isRequired: false,
    });
    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [error, setError] = useState<Partial<OptionForm>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const {
        loading: optionLoading,
        options,
        createOption,
        updateOption,
        getOptionsByMenuItemId,
        deleteOption,
        toggleOptionRequired,
    } = useOptionStore();

    useEffect(() => {
        loadOptions();
    }, [menuItem._id]);

    const loadOptions = async () => {
        await getOptionsByMenuItemId(menuItem._id);
    };

    const changeEventHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setInput({
            ...input,
            [name]: type === "number" ? Number(value) : value,
        });
    };

    const checkboxChangeHandler = (checked: boolean) => {
        setInput({ ...input, isRequired: checked });
    };

    const resetForm = () => {
        setInput({
            name: "",
            price: 0,
            isRequired: false,
        });
        setIsEditing(false);
        setEditingId(null);
        setError({});
    };

    const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!input.name) {
            setError({ name: "Option name is required" });
            return;
        }

        try {
            if (isEditing && editingId) {
                await updateOption(editingId, {
                    name: input.name,
                    price: input.price,
                    isRequired: input.isRequired,
                });
            } else {
                await createOption({
                    menuItemId: menuItem._id,
                    name: input.name,
                    price: input.price,
                    isRequired: input.isRequired,
                });
            }
            setOpen(false);
            resetForm();
            await loadOptions();
        } catch (error) {
            console.log(error);
        }
    };

    const handleEdit = (option: any) => {
        setInput({
            name: option.name,
            price: option.price,
            isRequired: option.isRequired,
        });
        setEditingId(option._id);
        setIsEditing(true);
        setOpen(true);
    };

    const handleDelete = (optionId: string) => {
        setDeleteId(optionId);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await deleteOption(deleteId);
            setDeleteOpen(false);
            setDeleteId(null);
            await loadOptions();
        }
    };

    return (
        <div className="max-w-7xl mx-auto my-10">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" onClick={onBack}>
                    ← Back to Menu Items
                </Button>
                <h1 className="font-bold md:font-extrabold text-lg md:text-2xl">
                    Options for {menuItem.name}
                </h1>
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                    <strong>Item Price:</strong> ${menuItem.price.toFixed(2)} | 
                    <strong className="ml-4">Category:</strong> {menuItem.category}
                </p>
                <p className="text-sm text-blue-600 mt-2">
                    Add options like "Extra Cheese", "Large Size", etc. to customize this menu item.
                </p>
            </div>

            <div className="flex justify-end mb-6">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-orange hover:bg-hoverOrange"
                            onClick={resetForm}
                        >
                            <Plus className="mr-2" />
                            Add Option
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {isEditing ? "Edit Option" : "Add a New Option"}
                            </DialogTitle>
                            <DialogDescription>
                                {isEditing
                                    ? "Update option details"
                                    : "Create a new option for this menu item."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitHandler}>
                            <div className="space-y-4">
                                {/* Option Name */}
                                <div>
                                    <Label>Option Name</Label>
                                    <Input
                                        type="text"
                                        name="name"
                                        value={input.name}
                                        onChange={changeEventHandler}
                                        placeholder="e.g., Extra Cheese"
                                    />
                                    {error.name && (
                                        <span className="text-red-500 text-sm">
                                            {error.name}
                                        </span>
                                    )}
                                </div>

                                {/* Price */}
                                <div>
                                    <Label>Additional Price</Label>
                                    <Input
                                        type="number"
                                        name="price"
                                        value={input.price}
                                        onChange={changeEventHandler}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>

                                {/* Required Checkbox */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isRequired"
                                        checked={input.isRequired}
                                        onCheckedChange={checkboxChangeHandler}
                                    />
                                    <Label
                                        htmlFor="isRequired"
                                        className="cursor-pointer font-normal"
                                    >
                                        Make this option required
                                    </Label>
                                </div>
                            </div>

                            <DialogFooter className="mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setOpen(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={optionLoading}
                                    className="bg-orange hover:bg-hoverOrange"
                                >
                                    {optionLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {isEditing ? "Updating..." : "Creating..."}
                                        </>
                                    ) : isEditing ? (
                                        "Update Option"
                                    ) : (
                                        "Create Option"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Options List */}
            {optionLoading && !options.length ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="animate-spin h-8 w-8" />
                </div>
            ) : options.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p>No options added yet. Create one to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {options.map((option) => (
                        <div
                            key={option._id}
                            className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">
                                        {option.name}
                                    </h3>
                                    <div className="mt-2 text-sm text-gray-600">
                                        <p className="font-semibold text-orange">
                                            +${option.price.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Required Badge */}
                                <span
                                    className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2 ${
                                        option.isRequired
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-gray-100 text-gray-700"
                                    }`}
                                >
                                    {option.isRequired ? "Required" : "Optional"}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(option)}
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        toggleOptionRequired(option._id)
                                    }
                                    disabled={optionLoading}
                                >
                                    {option.isRequired ? (
                                        <ToggleRight className="h-4 w-4 text-yellow-600" />
                                    ) : (
                                        <ToggleLeft className="h-4 w-4 text-gray-600" />
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(option._id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Option?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will remove this option from the menu item.
                            This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {optionLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default OptionManagement;
