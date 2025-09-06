import HealthForm from '../componentes/HealthForm';

const HealthPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-surface-50 to-surface-100 dark:from-[#0b1220] dark:via-[#0b1220] dark:to-[#111a29] transition-colors">
      <div className="pt-20 pb-16">
        <HealthForm />
      </div>
    </div>
  );
};

export default HealthPage;
