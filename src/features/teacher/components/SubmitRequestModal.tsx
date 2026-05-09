import { useState } from 'react';
import { Modal, Form, Input, Select, Upload, Button } from 'antd';
import { Upload as UploadIcon, AlertCircle, Layout, Send } from 'lucide-react';
import { useCreateRequest } from '../../../hooks/useRequests';

interface SubmitRequestModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SubmitRequestModal({ visible, onClose }: SubmitRequestModalProps) {
  const [form] = Form.useForm();
  const { mutate: createRequest, isPending } = useCreateRequest();
  const [fileList, setFileList] = useState<any[]>([]);

  const handleSubmit = (values: any) => {
    const input = {
      ...values,
      attachments: fileList.map(f => f.originFileObj).filter(Boolean),
    };

    createRequest(input, {
      onSuccess: () => {
        form.resetFields();
        setFileList([]);
        onClose();
      },
    });
  };

  const typeOptions = [
    { label: 'Vacation', value: 'vacation' },
    { label: 'Sick Leave', value: 'sick_leave' },
    { label: 'Technical Issue', value: 'technical_issue' },
    { label: 'Reschedule', value: 'reschedule' },
    { label: 'Excuse', value: 'excuse' },
    { label: 'Emergency', value: 'emergency' },
    { label: 'Others', value: 'others' },
  ];

  const priorityOptions = [
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Layout size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Submit New Request</h3>
            <p className="text-xs font-medium text-gray-400">Our team will review your request shortly</p>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
      className="premium-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-6"
        initialValues={{ priority: 'medium' }}
      >
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label={<span className="text-sm font-bold text-gray-700">Request Type</span>}
            name="type"
            rules={[{ required: true, message: 'Please select type' }]}
          >
            <Select options={typeOptions} placeholder="Select type" className="h-11 rounded-xl" />
          </Form.Item>

          <Form.Item
            label={<span className="text-sm font-bold text-gray-700">Priority Level</span>}
            name="priority"
            rules={[{ required: true }]}
          >
            <Select options={priorityOptions} placeholder="Select priority" className="h-11 rounded-xl" />
          </Form.Item>
        </div>

        <Form.Item
          label={<span className="text-sm font-bold text-gray-700">Request Title</span>}
          name="title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input placeholder="e.g. Vacation Request for next week" className="h-11 rounded-xl" />
        </Form.Item>

        <Form.Item
          label={<span className="text-sm font-bold text-gray-700">Reason / Details</span>}
          name="reason"
          rules={[{ required: true, message: 'Please provide details' }]}
        >
          <Input.TextArea 
            placeholder="Explain the reason for your request..." 
            rows={4} 
            className="rounded-xl p-4" 
          />
        </Form.Item>

        <Form.Item label={<span className="text-sm font-bold text-gray-700">Attachments (Optional)</span>}>
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            multiple
          >
            {fileList.length >= 5 ? null : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <UploadIcon size={20} />
                <span className="text-[10px] mt-1 font-bold">Upload</span>
              </div>
            )}
          </Upload>
          <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 font-medium">
            <AlertCircle size={12} /> Images and documents supported (Max 5 files)
          </p>
        </Form.Item>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 mt-8">
          <Button onClick={onClose} className="h-11 px-6 rounded-xl font-bold text-gray-600">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            icon={<Send size={16} />}
            className="h-11 px-10 rounded-xl font-bold bg-blue-600 border-none shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            Submit Request
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
