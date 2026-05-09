import { Modal, Form, Input, Select, DatePicker, TimePicker, Button } from 'antd';
import { MessageSquare, Calendar, Clock } from 'lucide-react';
import { useCreateRequest } from '../../../hooks/useRequests';
import { RequestType } from '../../../types/requests';
import dayjs from 'dayjs';

interface AddRequestModalProps {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  sessionTitle: string;
}

export default function AddRequestModal({ visible, onClose, sessionId, sessionTitle }: AddRequestModalProps) {
  const [form] = Form.useForm();
  const { mutate: createRequest, isPending } = useCreateRequest();

  const handleSubmit = (values: any) => {
    let newStartTime = '';

    if (values.type === 'reschedule' && values.date && values.time) {
      const date = dayjs(values.date);
      const time = dayjs(values.time);
      newStartTime = date
        .hour(time.hour())
        .minute(time.minute())
        .second(0)
        .toISOString();
    }

    const requestData = {
      sessionId,
      type: values.type as RequestType,
      reason: values.reason,
      requestedData: values.type === 'reschedule' ? {
        new_start_time: newStartTime,
      } : {}
    };

    createRequest(requestData, {
      onSuccess: () => {
        onClose();
        form.resetFields();
      },
    });
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add Session Request</h3>
            <p className="text-xs font-medium text-slate-400">Request changes for: {sessionTitle}</p>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      className="premium-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-6"
        initialValues={{ type: 'reschedule' }}
      >
        <Form.Item
          label={<span className="text-sm font-bold text-slate-700">Request Type</span>}
          name="type"
          rules={[{ required: true }]}
        >
          <Select className="h-11 rounded-xl">
            <Select.Option value="reschedule">Reschedule Session</Select.Option>
            <Select.Option value="cancel">Cancel Session</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
          {({ getFieldValue }) =>
            getFieldValue('type') === 'reschedule' && (
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label={<span className="text-sm font-bold text-slate-700 flex items-center gap-2"><Calendar size={14} /> Date</span>}
                  name="date"
                  rules={[{ required: true, message: 'Select date' }]}
                >
                  <DatePicker
                    className="w-full h-11 rounded-xl"
                    placeholder="Pick date"
                  />
                </Form.Item>
                <Form.Item
                  label={<span className="text-sm font-bold text-slate-700 flex items-center gap-2"><Clock size={14} /> Time</span>}
                  name="time"
                  rules={[{ required: true, message: 'Select time' }]}
                >
                  <TimePicker
                    format="HH:mm"
                    className="w-full h-11 rounded-xl"
                    placeholder="Pick time"
                  />
                </Form.Item>
              </div>
            )
          }
        </Form.Item>

        <Form.Item
          label={<span className="text-sm font-bold text-slate-700">Reason / Details</span>}
          name="reason"
          rules={[{ required: true, message: 'Please provide a reason' }]}
        >
          <Input.TextArea
            placeholder="Explain why you are making this request..."
            rows={4}
            className="rounded-xl"
          />
        </Form.Item>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-50">
          <Button onClick={onClose} className="h-11 px-6 rounded-xl font-bold text-slate-600">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            className="h-11 px-8 rounded-xl font-bold bg-blue-600 border-none shadow-lg shadow-blue-200"
          >
            Submit Request
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

