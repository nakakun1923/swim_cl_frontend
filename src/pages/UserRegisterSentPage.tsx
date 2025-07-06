import { useLocation, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';

export const UserRegisterSentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as any)?.email;

  return (
    <PageLayout title="認証メールを送信しました" subtitle="メールをご確認ください">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow text-center">
        <p className="mb-4 text-gray-700">
          {email ? (
            <>
              <span className="font-semibold">{email}</span> 宛に認証用メールを送信しました。<br />
              メール内のリンクをクリックして登録を完了してください。<br />
              自動遷移はしないため、認証後は下記ボタンからログインをお願いします。
            </>
          ) : (
            <>ご登録のメールアドレス宛に認証用メールを送信しました。<br />メール内のリンクをクリックして登録を完了してください。</>
          )}
        </p>
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          ログイン画面へ
        </button>
      </div>
    </PageLayout>
  );
}; 