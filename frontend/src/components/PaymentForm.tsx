import React, {useState} from 'react';

interface PaymentFormData {
  pan: string;
  expire: string;
  cardholder: string;
  cvc: string;
}

const PaymentForm: React.FC = () => {
  const [formData, setFormData] = useState<PaymentFormData>({
    pan: '',
    expire: '',
    cardholder: '',
    cvc: '',
  });

  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = event.target;
    setFormData((prev) => ({...prev, [name]: value}));
    setErrors((prev) => ({...prev, [name]: undefined}));
  };

  const handleChangePan = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {name} = event.target;
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 19) {
      value = value.slice(0, 19);
    }

    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');

    setFormData((prev) => ({...prev, pan: formattedValue}));
    setErrors((prev) => ({...prev, [name]: undefined}));
  };

  const handleChangeExpire = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {value, name} = event.target;
    const digits = value.replace(/\D/g, '');

    const formattedValue =
      digits.length > 2
        ? `${digits.slice(0, 2)}/${digits.slice(2, 4)}`
        : digits;

    setFormData((prev) => ({
      ...prev,
      expire: formattedValue,
    }));
    setErrors((prev) => ({...prev, [name]: undefined}));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};
    const cardRegex = /^\d{13,19}$/;
    const expireRegex = /^(0[1-9]|1[0-2])\/(2[1-6])$/;
    const cvcRegex = /^\d{3}$/;
    const cardholderRegex = /^[A-Za-z]+( [A-Za-z]+)+$/;

    if (!cardRegex.test(formData.pan.replace(/\s/g, '')))
      newErrors.pan = 'Введите корректный номер карты';
    if (!expireRegex.test(formData.expire)) newErrors.expire = 'Введите дату в формате MM/YY';
    if (!cvcRegex.test(formData.cvc)) newErrors.cvc = 'Введите 3 цифры';
    if (!cardholderRegex.test(formData.cardholder))
      newErrors.cardholder = 'Имя владельца должно содержать два слова латиницей';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:2050/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: Date.now().toString(),
          jsonrpc: '2.0',
          method: 'pay',
          params: formData,
        }),
      });

      const data = await response.json();

      if (data.result?.pid) {
        window.location.href = `/status/${data.result.pid}`;
      } else {
        setErrors({pan: 'Ошибка при отправке данных'});
      }
    } catch (error) {
      setErrors({pan: 'Ошибка соединения с сервером'});
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg"
      onSubmit={handleSubmit}
    >
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Оплата банковской картой
      </h1>

      <div className="mb-4">
        <label htmlFor="pan" className="block text-sm font-medium text-gray-700 mb-2">
          Номер карты
        </label>
        <input
          id="pan"
          type="text"
          name="pan"
          value={formData.pan}
          onChange={handleChangePan}
          className={`w-full px-4 py-2 border ${
            errors.pan ? 'border-red-500' : 'border-gray-300'
          } rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500`}
          maxLength={23}
          placeholder="0000 0000 0000 0000"
          aria-invalid={!!errors.pan}
          aria-describedby="pan-error"
        />
        {errors.pan && (
          <p id="pan-error" className="text-red-500 text-sm mt-1">
            {errors.pan}
          </p>
        )}
      </div>

      <div className="flex">
        <div className="mb-4 mr-4">
          <label htmlFor="expire" className="block text-sm font-medium text-gray-700 mb-2">
            Месяц/Год
          </label>
          <input
            id="expire"
            type="text"
            name="expire"
            value={formData.expire}
            onChange={handleChangeExpire}
            placeholder="MM/YY"
            className={`w-full px-4 py-2 border ${
              errors.expire ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500`}
            aria-invalid={!!errors.expire}
            aria-describedby="expire-error"
          />
          {errors.expire && (
            <p id="expire-error" className="text-red-500 text-sm mt-1">
              {errors.expire}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-2">
            Код безопасности
          </label>
          <input
            id="cvc"
            type="password"
            name="cvc"
            value={formData.cvc}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${
              errors.cvc ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500`}
            maxLength={3}
            placeholder="***"
            aria-invalid={!!errors.cvc}
            aria-describedby="cvc-error"
          />
          {errors.cvc && (
            <p id="cvc-error" className="text-red-500 text-sm mt-1">
              {errors.cvc}
            </p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="cardholder" className="block text-sm font-medium text-gray-700 mb-2">
          Владелец карты
        </label>
        <input
          id="cardholder"
          type="text"
          name="cardholder"
          value={formData.cardholder}
          onChange={handleChange}
          className={`w-full px-4 py-2 border ${
            errors.cardholder ? 'border-red-500' : 'border-gray-300'
          } rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500`}
          aria-invalid={!!errors.cardholder}
          aria-describedby="cardholder-error"
          placeholder="IVAN IVANOV"
        />
        {errors.cardholder && (
          <p id="cardholder-error" className="text-red-500 text-sm mt-1">
            {errors.cardholder}
          </p>
        )}
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className=" w-1/3 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:bg-gray-400 flex justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? <div role="status">
            <svg aria-hidden="true" className="w-7 h-7 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                 viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"/>
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"/>
            </svg>
          </div> : 'Оплатить'}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
