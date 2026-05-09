import { Modal, Form, Input, Select, Button, Upload } from 'antd';
import { useCreateCourse, useUpdateCourse } from '../../../hooks/useCourses';
import { useQueryClient } from '@tanstack/react-query';
import { BookOpen, AlignLeft, Trophy, Image, Upload as UploadIcon } from 'lucide-react';
import { useGetRanks } from '../hooks/useRank';
import { useEffect, useState } from 'react';

interface AddCourseModalProps {
    visible: boolean;
    onClose: () => void;
    course?: any;
}

export default function AddCourseModal({ visible, onClose, course }: AddCourseModalProps) {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<any[]>([]);
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
            if (course.image) {
                setFileList([{
                    uid: '-1',
                    name: course.image,
                    status: 'done',
                    url: `https://agro-plus.net/uploads/${course.image}`,
                }]);
            } else {
                setFileList([]);
            }
        } else if (visible && !course) {
            form.resetFields();
            setFileList([]);
        }
    }, [visible, course, form]);

    const handleSubmit = (values: any) => {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description);
        formData.append('rankId', values.rankId);

        if (fileList.length > 0 && fileList[0].originFileObj) {
            formData.append('image', fileList[0].originFileObj);
        }

        if (isEditMode) {
            updateCourse({ id: course.id, data: formData as any }, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['courses'] });
                    onClose();
                }
            });
        } else {
            createCourse(formData, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['courses'] });
                    onClose();
                    form.resetFields();
                    setFileList([]);
                }
            });
        }
    };

    const handleUploadChange = ({ fileList: newFileList }: any) => {
        setFileList(newFileList);
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

                <Form.Item
                    label={<span className="text-gray-700 font-bold flex items-center gap-2"><Image size={14} className="text-indigo-500" /> Course Image</span>}
                >
                    <Upload.Dragger
                        listType="picture"
                        fileList={fileList}
                        onChange={handleUploadChange}
                        beforeUpload={() => false}
                        maxCount={1}
                        className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl hover:border-indigo-400 transition-all overflow-hidden"
                    >
                        {fileList.length < 1 ? (
                            <div className="py-6">
                                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-3">
                                    <UploadIcon size={24} className="text-indigo-500" />
                                </div>
                                <p className="text-sm font-bold text-gray-700 mb-1">Click or drag image to upload</p>
                                <p className="text-[10px] text-gray-400 font-medium">PNG, JPG or JPEG up to 5MB</p>
                            </div>
                        ) : null}
                    </Upload.Dragger>
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
