import React, { forwardRef } from 'react';

type InvoiceProps = {
  order: any;
};

const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(({ order }, ref) => {
  const o = order?.order || order;

  const company = {
    name: 'Flaunt by Nishi',
    email: 'flauntbynishi@gmail.com',
    address: 'W 12 Laxminarayan Estate, BRC compound, Udhana, Surat, 394210',
    phone: '+91 79871 47114',
  };

  const fmt = (n: number) => `₹${(n || 0).toFixed(2)}`;

  return (
    <div
      ref={ref}
      style={{ width: 800, fontFamily: 'Arial, Helvetica, sans-serif' }}
      className="invoice-root bg-white"
    >
      <div style={{ background: '#8B4B2A', height: 16 }} />

      <div style={{ padding: 24, borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 90, height: 60, background: '#fff2e8', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>
              <strong style={{ color: '#8B4B2A', fontSize: 18 }}>Flaunt</strong>
            </div>
            <div>
              <div style={{ fontSize: 14, color: '#8B4B2A', fontWeight: 700 }}>{company.name}</div>
              <div style={{ fontSize: 12, color: '#333' }}>{company.email}</div>
              <div style={{ fontSize: 12, color: '#333' }}>{company.address}</div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#333' }}>{company.phone}</div>
            <div style={{ marginTop: 8, fontSize: 14, fontWeight: 700, color: '#8B4B2A' }}>Invoice</div>
            <div style={{ fontSize: 12, color: '#666' }}>#{o?.orderNumber || o?._id}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{new Date(o?.createdAt || Date.now()).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#8B4B2A', fontWeight: 700 }}>Bill To</div>
            <div style={{ fontSize: 14, color: '#333', marginTop: 6 }}>{o?.shippingAddress?.name || o?.customerName || ''}</div>
            <div style={{ fontSize: 12, color: '#333' }}>{o?.shippingAddress?.street}</div>
            <div style={{ fontSize: 12, color: '#333' }}>{o?.shippingAddress?.city}, {o?.shippingAddress?.state} {o?.shippingAddress?.zipCode}</div>
            <div style={{ fontSize: 12, color: '#333' }}>{o?.shippingAddress?.country}</div>
          </div>

          <div style={{ width: 240 }}>
            <div style={{ fontSize: 12, color: '#8B4B2A', fontWeight: 700 }}>Payment</div>
            <div style={{ fontSize: 12, color: '#333', marginTop: 6 }}>Method: {o?.payment?.method || 'N/A'}</div>
            <div style={{ fontSize: 12, color: '#333' }}>Status: {o?.payment?.status || 'N/A'}</div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee', color: '#8B4B2A' }}>Item</th>
                <th style={{ textAlign: 'center', padding: 8, borderBottom: '1px solid #eee', color: '#8B4B2A' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #eee', color: '#8B4B2A' }}>Price</th>
                <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #eee', color: '#8B4B2A' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(o?.items) && o.items.map((it: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ padding: 8, borderBottom: '1px solid #f3f3f3' }}>{it.product?.name || it.name}</td>
                  <td style={{ padding: 8, textAlign: 'center', borderBottom: '1px solid #f3f3f3' }}>{it.quantity}</td>
                  <td style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #f3f3f3' }}>{fmt(it.price)}</td>
                  <td style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #f3f3f3' }}>{fmt((it.price || 0) * (it.quantity || 1))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <div style={{ width: 300 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <div style={{ color: '#666' }}>Subtotal</div>
              <div style={{ fontWeight: 700 }}>{fmt(o?.subtotal || o?.subTotal || o?.items?.reduce((s: any, i: any) => s + (i.price * i.quantity), 0))}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <div style={{ color: '#666' }}>Shipping</div>
              <div style={{ fontWeight: 700 }}>{fmt(o?.shipping?.cost || o?.shippingCost || 0)}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <div style={{ color: '#666' }}>Tax</div>
              <div style={{ fontWeight: 700 }}>{fmt(o?.tax || 0)}</div>
            </div>
            <div style={{ borderTop: '1px dashed #e6e6e6', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800, color: '#8B4B2A' }}>Total</div>
              <div style={{ fontWeight: 800, color: '#8B4B2A' }}>{fmt(o?.total || 0)}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 30 }}>
          <div style={{ fontSize: 12, color: '#666' }}>Notes</div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#333' }}>{o?.notes || 'Thank you for your purchase!'}</div>
        </div>
      </div>

      <div style={{ background: '#8B4B2A', height: 16, marginTop: 12 }} />
    </div>
  );
});

Invoice.displayName = 'Invoice';

export default Invoice;
