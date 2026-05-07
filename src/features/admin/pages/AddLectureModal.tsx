import { Modal, Form, Input, InputNumber, Button } from 'antd';
import { useCreateLecture, useUpdateLecture } from '../../../hooks/useLectures';
import { useQueryClient } from '@tanstack/react-query';
import { Video, AlignLeft, Type, Hash } from 'lucide-react';
import { useEffect } from 'react';
import { Lecture } from '../../../types/lectures';

interface AddLectureModalProps {
    visible: boolean;
    onClose: () => void;
    courseId: string;
    lecture?: Lecture;
}

export default function AddLectureModal({ visible, onClose, courseId, lecture }: AddLectureModalProps) {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const { mutate: createLecture, isPending: isCreating } = useCreateLecture();
    const { mutate: updateLecture, isPending: isUpdating } = useUpdateLecture();

    const isEditMode = !!lecture;

    useEffect(() => {
        if (visible && lecture) {
            form.setFieldsValue({
                title: lecture.title,
                content: lecture.content,
                videoUrl: lecture.videoUrl,
                order: lecture.order,
            });
        } else if (visible && !lecture) {
            form.resetFields();
            form.setFieldValue('order', 1);
        }
    }, [visible, lecture, form]);

    const handleSubmit = (values: any) => {
        const payload = { ...values, courseId };
        
        if (isEditMode && lecture) {
            updateLecture({ id: lecture.id, data: payload }, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
                    queryClient.invalidateQueries({ queryKey: ['courses'] });
                    onClose();
                }
            });
        } else {
            createLecture(payload, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
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
                        <Video size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{isEditMode ? 'Edit Lecture' : 'Add New Lecture'}</h3>
                        <p className="text-xs font-medium text-gray-400">
                            {isEditMode ? 'Update existing lecture content' : 'Add a new lecture to this course curriculum'}
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
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                className="mt-6"
            >
                <Form.Item
                    label={<span className="text-gray-700 font-bold flex items-center gap-2"><Type size={14} className="text-indigo-500" /> Lecture Title</span>}
                    name="title"
                    rules={[{ required: true, message: 'Please enter lecture title' }]}
                >
                    <Input placeholder="e.g. Introduction to React Hooks" className="h-12 rounded-xl border-gray-200 focus:border-indigo-500 transition-all" />
                </Form.Item>

                <Form.Item
                    label={<span className="text-gray-700 font-bold flex items-center gap-2"><AlignLeft size={14} className="text-indigo-500" /> Content / Description</span>}
                    name="content"
                    rules={[{ required: true, message: 'Please enter lecture content' }]}
                >
                    <Input.TextArea placeholder="Enter lecture details or transcript..." rows={4} className="rounded-xl border-gray-200 focus:border-indigo-500 transition-all" />
                </Form.Item>

                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <Form.Item
                            label={<span className="text-gray-700 font-bold flex items-center gap-2"><Video size={14} className="text-indigo-500" /> Video URL</span>}
                            name="videoUrl"
                            rules={[{ required: true, message: 'Please enter video URL' }]}
                        >
                            <Input placeholder="YouTube, Vimeo, or direct link" className="h-12 rounded-xl border-gray-200 focus:border-indigo-500 transition-all" />
                        </Form.Item>
                    </div>
                    <div className="col-span-1">
                        <Form.Item
                            label={<span className="text-gray-700 font-bold flex items-center gap-2"><Hash size={14} className="text-indigo-500" /> Order</span>}
                            name="order"
                            rules={[{ required: true, message: 'Required' }]}
                        >
                            <InputNumber min={1} className="w-full h-12 rounded-xl border-gray-200 flex items-center" />
                        </Form.Item>
                    </div>
                </div>

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
                        {isEditMode ? 'Update Lecture' : 'Add Lecture'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
