import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, XCircle } from 'lucide-react';
import { clearToast } from '../../features/ui/uiSlice';

export default function Toast() {
  const toast = useSelector((state) => state.ui.toast);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => dispatch(clearToast()), 3000);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg dark:border-gray-800 dark:bg-gray-900">
      {isError ? (
        <XCircle size={18} className="text-red-500" />
      ) : (
        <CheckCircle2 size={18} className="text-emerald-500" />
      )}
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{toast.message}</p>
    </div>
  );
}
