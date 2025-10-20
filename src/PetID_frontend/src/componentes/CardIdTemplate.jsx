import React from 'react';
import ICPImage from './ICPImage';
import Logo from "../assets/logo/logo.jpg";

// Componente reaproveitável do template do cartão (estrutura + classes)
const CardIdTemplate = ({
  pet,
  qrDataUrl,
  verifyUrl,
  actor,
  formatDate = (d) => d,
  simplifiedId = null,
  onPrintInfo = null,
}) => {
  return (
    <div className="card" style={{ maxWidth: 960 }}>
      <div className="topbar">
        <div className="brand"><img src={Logo} alt="PetID" style={{ width: 28, height: 28, borderRadius: 6 }} /> PetID</div>
      </div>

      <div className="grid">
        <div className="left">
          <div className="pill"><div className="label">Name</div><div className="value">{pet.nickname}</div></div>
          <div className="pill"><div className="label">Pet ID</div><div className="value">{pet.id}</div></div>
          <div className="pill"><div className="label">Breed</div><div className="value">{pet.breed ?? pet.species}</div></div>
          <div className="pill"><div className="label">Coat</div><div className="value">{pet.color}</div></div>
          <div className="pill"><div className="label">DOB</div><div className="value">{formatDate(pet.birthDate)}</div></div>
          <div className="pill"><div className="label">Sex</div><div className="value">{pet.gender}</div></div>
        </div>

        <div className="photoWrap">
          {pet.photo ? (
            <ICPImage assetId={pet.photo} altText={pet.nickname} className="photo" actor={actor} />
          ) : (
            <img alt={pet.nickname} className="photo" src="/src/assets/logo/logo.jpg" />
          )}

          <div className="status"><span>🏠</span><span>Home</span></div>

          <div className="ownerRibbon">
            <div className="title">Owner</div>
            <div className="address">{pet.owner ?? pet.ownerAddress}</div>
          </div>

          {qrDataUrl && (
            <div className="qr"><img width="96" height="96" src={qrDataUrl} alt="QR" style={{ display: 'block', borderRadius: 6 }} /></div>
          )}
        </div>
      </div>

      <style jsx>{`
        .card{background:#24445b;padding:28px;border-radius:14px;color:#dbeafe;display:flex;flex-direction:column;gap:12px}
        .topbar{display:flex;align-items:center;gap:12px}
        .brand{display:flex;align-items:center;gap:10px;font-weight:700}
        .grid{display:flex;gap:18px}
        .left{flex:1;display:flex;flex-direction:column;gap:12px}
        .pill{background:rgba(255,255,255,0.06);padding:14px;border-radius:8px;display:flex;justify-content:space-between;align-items:center}
        .pill .label{opacity:0.7;font-size:12px}
        .pill .value{font-weight:800}
        .photoWrap{position:relative;width:320px;height:320px;border-radius:14px;overflow:hidden;display:flex;align-items:center;justify-content:center}
        .photo{width:100%;height:100%;object-fit:cover}
        .status{position:absolute;top:12px;right:12px;background:#10b981;color:white;padding:8px 12px;border-radius:20px;display:flex;gap:8px;align-items:center}
        .ownerRibbon{position:absolute;right:18px;bottom:18px;background:#ffffff;color:#0b1220;padding:12px 14px;border-radius:12px;border:1px solid rgba(2,6,23,0.06);box-shadow:0 10px 22px rgba(2,6,23,0.12);max-width:54%}
        .ownerRibbon .title{font-size:12px;letter-spacing:.6px;text-transform:uppercase;color:#2b6cb0;font-weight:800;margin-bottom:6px}
        .ownerRibbon .address{font-family:'JetBrains Mono','Courier New',monospace;font-size:12px;word-break:break-all;color:#334155}
        .qr{position:absolute;left:18px;bottom:18px;background:white;padding:8px;border-radius:8px}
      `}</style>
    </div>
  );
};

export default CardIdTemplate;
