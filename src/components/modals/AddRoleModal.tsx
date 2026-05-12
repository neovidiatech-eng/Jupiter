import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getRoleSchema, RoleFormData } from '../../lib/schemas/RoleSchema';
import { useEffect } from 'react';
import { usePermissions } from '../../features/admin/hooks/usePermissions';
import { Controller } from 'react-hook-form';
import { CustomCheckbox } from '../ui/CustomCheckbox';

interface AddRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: RoleFormData) => void;
    initialData?: RoleFormData | null;
    isLoading?: boolean;
}

export default function AddRoleModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading,
}: AddRoleModalProps) {
    const { t } = useTranslation();

    const isEdit = !!initialData;

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<RoleFormData>({
        resolver: zodResolver(getRoleSchema(t)),
        defaultValues: {
            name: '',
            permissionIds: [],
        },
    });

    const { data: permissions, isLoading: isLoadingPermissions } = usePermissions();

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                permissionIds: initialData.permissionIds || [],
            });
        } else {
            reset({ name: '', permissionIds: [] });
        }
    }, [initialData, reset]);

    const handleClose = () => {
        reset();
        onClose();
    };

    const onFormSubmit = (data: RoleFormData) => {
        onSubmit(data);
        reset();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col">

                {/* Header */}
                <div className="p-6 flex justify-between items-center bg-primary text-white">
                    <h2 className="text-xl font-bold">
                        {isEdit ? t('editRole') : t('addNewRole')}
                    </h2>

                    <button onClick={handleClose}>
                        <X />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit(onFormSubmit)}
                    className="p-6 space-y-6 text-start"
                >
                    {/* Role Name */}
                    <div>
                        <label className="block mb-2 font-medium">
                            {t('roleName')}
                        </label>

                        <input
                            {...register('name')}
                            className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-200'
                                }`}
                            placeholder={t('roleName')}
                        />

                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Permissions */}
                    <div>
                        <label className="block mb-4 font-medium">
                            {t('permissions')}
                        </label>

                        {isLoadingPermissions ? (
                            <div className="space-y-3 w-[90%]">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <Controller
                                name="permissionIds"
                                control={control}
                                render={({ field }) => (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                        {permissions?.data?.map((permission: any) => {
                                            const isChecked = field.value?.includes(permission.id);
                                            return (
                                                <label
                                                    key={permission.id}
                                                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${isChecked
                                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                        : 'border-gray-200 hover:border-primary/50 bg-white'
                                                        }`}
                                                >
                                                    <CustomCheckbox
                                                        checked={isChecked}
                                                        onChange={() => {
                                                            const newValue = isChecked
                                                                ? field.value.filter((id: string) => id !== permission.id)
                                                                : [...(field.value || []), permission.id];
                                                            field.onChange(newValue);
                                                        }}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className={`font-semibold text-sm ${isChecked ? 'text-primary' : 'text-gray-700'}`}>
                                                            {permission.name}
                                                        </span>
                                                        {permission.description && (
                                                            <span className="text-xs text-gray-500 line-clamp-1">
                                                                {permission.description}
                                                            </span>
                                                        )}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            />
                        )}

                        {errors.permissionIds && (
                            <p className="text-red-500 text-sm mt-2">
                                {errors.permissionIds.message}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 btn-primary text-white py-3 rounded-xl font-bold"
                        >
                            {isLoading
                                ? t('saving')
                                : isEdit
                                    ? t('update')
                                    : t('add')}
                        </button>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-3 border rounded-xl"
                        >
                            {t('cancel')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
