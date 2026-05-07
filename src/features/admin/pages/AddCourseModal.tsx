import { Modal, Form, Input, Select, Button } from 'antd';
import { useCreateCourse, useUpdateCourse } from '../../../hooks/useCourses';
import { useQueryClient } from '@tanstack/react-query';
import { BookOpen, AlignLeft, Trophy } from 'lucide-react';
import { useGetRanks } from '../hooks/useRank';
import { useEffect } from 'react';

interface AddCourseModalProps {
    visible: boolean;
    onClose: () => void;
    course?: any;
}

export default function AddCourseModal({ visible, onClose, course }: AddCourseModalProps) {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const { mutate: createCourse, isPending: isCreating } = useCreateCourse();
    const { mutate: updateCourse, isPending: isUpdating } = useUpdateCourse();
    const { data: ranksData, isLoading: ranksLoading } = useGetRanks();

    const isEditMode = !!course;

    useEffect(() => {
        if (visible && course) {
            form.setFieldsValue({
                title: course.title,
                description: course.description,
                rankId: course.rankId,
            });
        } else if (visible && !course) {
            form.resetFields();
        }
    }, [visible, course, form]);

    const handleSubmit = (values: any) => {
        if (isEditMode) {
            updateCourse({ id: course.id, data: values }, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['courses'] });
                    onClose();
                }
            });
        } else {
            createCourse(values, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['courses'] });
                    onClose();
                    form.resetFields();
                }
            });
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{isEditMode ? 'Edit Course' : 'Create New Course'}</h3>
                        <p className="text-xs font-medium text-gray-400">
                            {isEditMode ? 'Modify existing course details' : 'Add a new academic course to the curriculum shelf'}
                        </p>
                    </div>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            centered
            width={520}
            className="premium-modal"
            closeIcon={<div className="bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors"><MoreVertical size={16} /></div>}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                className="mt-6"
            >
                <Form.Item
                    label={<span className="text-gray-700 font-bold flex items-center gap-2"><BookOpen size={14} className="text-indigo-500" /> Course Title</span>}
                    name="title"
                    rules={[{ required: true, message: 'Please enter course title' }]}
                >
                    <Input placeholder="e.g. Backend Development Basics" className="h-12 rounded-xl border-gray-200 focus:border-indigo-500 transition-all" />
                </Form.Item>

                <Form.Item
                    label={<span className="text-gray-700 font-bold flex items-center gap-2"><AlignLeft size={14} className="text-indigo-500" /> Description</span>}
                    name="description"
                    rules={[{ required: true, message: 'Please enter description' }]}
                >
                    <Input.TextArea placeholder="Enter a comprehensive description of the course content..." rows={4} className="rounded-xl border-gray-200 focus:border-indigo-500 transition-all" />
                </Form.Item>

                <Form.Item
                    label={<span className="text-gray-700 font-bold flex items-center gap-2"><Trophy size={14} className="text-indigo-500" /> Academic Rank</span>}
                    name="rankId"
                    rules={[{ required: true, message: 'Please select an academic rank' }]}
                >
                    <Select
                        placeholder="Select appropriate rank"
                        loading={ranksLoading}
                        className="h-12 rounded-xl"
                        options={ranksData?.data?.items?.map((rank: any) => ({
                            label: (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: rank.color }}></div>
                                    <span>{rank.name}</span>
                                </div>
                            ),
                            value: rank.id
                        }))}
                    />
                </Form.Item>

                <div className="flex items-center justify-end gap-3 mt-10 pt-6 border-t border-gray-50">
                    <Button 
                        onClick={onClose} 
                        className="h-12 px-6 rounded-xl font-bold text-gray-600 border-gray-200 hover:bg-gray-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isCreating || isUpdating}
                        className="h-12 px-10 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 border-none shadow-lg shadow-indigo-100"
                    >
                        {isEditMode ? 'Update Course' : 'Create Course'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}

const MoreVertical = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
);
