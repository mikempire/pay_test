import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

interface PaymentStatus {
  status: 'process' | 'ok' | 'fail';
}

const StatusPage: React.FC = () => {
  const {pid} = useParams<{ pid: string }>();
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      if (!pid) {
        throw new Error('Не указан идентификатор платежа');
      }

      const response = await fetch(`http://localhost:2050/pay/check/${pid}`);

      if (!response.ok) {
        throw new Error('Ошибка при выполнении запроса');
      }

      const data = await response.json();
      console.log('Ответ от сервера:', data);

      if (data?.status) {
        setStatus(data);
      } else {
        throw new Error('Некорректный формат ответа от сервера');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка соединения с сервером');
    }
  };

  useEffect(() => {
    if (!pid) {
      setError('Не указан идентификатор платежа');
      return;
    }
    fetchStatus();
  }, [pid]);

  useEffect(() => {
    if (status?.status === 'process') {
      const intervalId = setInterval(fetchStatus, 1000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [status]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-6 bg-white rounded shadow-md text-center">
          <svg className="h-8 w-8 text-red-500 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          <h1 className="text-xl mb-4">Произошла ошибка</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-6 bg-white rounded shadow-md text-center">
          <h1 className="text-xl font-bold">Загрузка статуса...</h1>
        </div>
      </div>
    );
  }

  const renderStatus = () => {
    switch (status.status) {
      case 'process':
        return <p>Платеж обрабатывается. Пожалуйста, подождите...</p>;
      case 'ok':
        return (
          <>
            <svg className="h-8 w-8 text-green-500 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
            </svg>
            <p>Оплата прошла успешно</p>
          </>
        )
      case 'fail':
        return <p>Платеж отклонен</p>;
      default:
        return <p>Неизвестный статус платежа</p>;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md text-center">
        {renderStatus()}
      </div>
    </div>
  );
};

export default StatusPage;
