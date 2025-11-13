import { useEffect, useMemo, useState } from 'react'
import { api } from './lib/api'

function Field({ label, children }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-gray-700">{label}</span>
      {children}
    </label>
  )
}

function SellerSection({ onCreated }) {
  const [name, setName] = useState('Demo Seller')
  const [email, setEmail] = useState('seller@example.com')
  const [loading, setLoading] = useState(false)

  const create = async () => {
    setLoading(true)
    try {
      const res = await api.createSeller({ name, email })
      onCreated(res.id)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
      <h3 className="text-lg font-semibold">Create a Seller</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name"><input className="input" value={name} onChange={e=>setName(e.target.value)} /></Field>
        <Field label="Email"><input className="input" value={email} onChange={e=>setEmail(e.target.value)} /></Field>
      </div>
      <button onClick={create} disabled={loading} className="btn">
        {loading ? 'Creating...' : 'Create Seller'}
      </button>
    </div>
  )
}

function ProductSection({ sellerId, onCreated }) {
  const [title, setTitle] = useState('T-Shirt')
  const [price, setPrice] = useState(20)
  const [loading, setLoading] = useState(false)

  const create = async () => {
    if (!sellerId) return alert('Create a seller first')
    setLoading(true)
    try {
      const res = await api.createProduct({ title, price: Number(price), seller_id: sellerId, in_stock: true })
      onCreated(res.id)
    } catch (e) { alert(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
      <h3 className="text-lg font-semibold">Create a Product</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Title"><input className="input" value={title} onChange={e=>setTitle(e.target.value)} /></Field>
        <Field label="Price"><input type="number" className="input" value={price} onChange={e=>setPrice(e.target.value)} /></Field>
      </div>
      <button onClick={create} disabled={loading || !sellerId} className="btn">
        {loading ? 'Creating...' : 'Create Product'}
      </button>
    </div>
  )
}

function StreamSection({ sellerId, productIds, onCreated }) {
  const [discount, setDiscount] = useState(25)
  const [duration, setDuration] = useState(300)
  const [loading, setLoading] = useState(false)

  const create = async () => {
    if (!sellerId || productIds.length === 0) return alert('Create seller and product first')
    setLoading(true)
    try {
      const res = await api.createStream({ seller_id: sellerId, product_ids: productIds, discount_percent: Number(discount), duration_seconds: Number(duration), title: 'Live Drop' })
      onCreated(res.id)
    } catch (e) { alert(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
      <h3 className="text-lg font-semibold">Start Live Stream (Discount Window)</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Discount %"><input type="number" className="input" value={discount} onChange={e=>setDiscount(e.target.value)} /></Field>
        <Field label="Duration (sec)"><input type="number" className="input" value={duration} onChange={e=>setDuration(e.target.value)} /></Field>
      </div>
      <button onClick={create} disabled={loading || !sellerId || productIds.length === 0} className="btn">
        {loading ? 'Starting...' : 'Go Live'}
      </button>
    </div>
  )
}

function BuyerPanel({ streamId, productId }) {
  const [stream, setStream] = useState(null)
  const [qty, setQty] = useState(1)
  const [name, setName] = useState('Jane Doe')
  const [email, setEmail] = useState('jane@example.com')
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    let interval
    const load = async () => {
      if (streamId) {
        try { setStream(await api.getStream(streamId)) } catch {}
      }
    }
    load()
    interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [streamId])

  const place = async () => {
    if (!stream?.active) return alert('Stream not active or expired')
    setPlacing(true)
    try {
      const res = await api.createOrder({ buyer_name: name, buyer_email: email, product_id: productId, quantity: Number(qty), stream_id: streamId })
      alert(`Order placed! Total: $${res.total_price}`)
    } catch (e) { alert(e.message) }
    finally { setPlacing(false) }
  }

  const remaining = useMemo(() => {
    if (!stream?.end_time) return null
    const end = new Date(stream.end_time).getTime()
    const now = Date.now()
    return Math.max(0, Math.floor((end - now) / 1000))
  }, [stream])

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
      <h3 className="text-lg font-semibold">Buyer Checkout</h3>
      {stream ? (
        <div className="p-3 rounded bg-green-50 border border-green-200">
          <p className="text-sm">Live now: {stream.title || 'Untitled'} {stream.active ? '✅' : '❌'}</p>
          <p className="text-sm">Discount: <span className="font-semibold">{stream.discount_percent}%</span> {remaining !== null && `(ends in ${remaining}s)`}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-600">Waiting for stream...</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name"><input className="input" value={name} onChange={e=>setName(e.target.value)} /></Field>
        <Field label="Email"><input className="input" value={email} onChange={e=>setEmail(e.target.value)} /></Field>
        <Field label="Quantity"><input type="number" className="input" value={qty} onChange={e=>setQty(e.target.value)} /></Field>
      </div>
      <button onClick={place} disabled={!stream?.active || placing} className="btn">
        {placing ? 'Placing...' : 'Buy with Live Discount'}
      </button>
    </div>
  )
}

function App() {
  const [sellerId, setSellerId] = useState('')
  const [productId, setProductId] = useState('')
  const [streamId, setStreamId] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Live Commerce Marketplace</h1>
          <p className="text-gray-600">Sellers can go live with limited-time discounts. Buyers purchase instantly while the stream is active.</p>
          <p className="text-xs text-gray-500">Backend: {api.baseUrl}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <SellerSection onCreated={setSellerId} />
            <ProductSection sellerId={sellerId} onCreated={setProductId} />
            <StreamSection sellerId={sellerId} productIds={productId ? [productId] : []} onCreated={setStreamId} />
          </div>
          <div className="space-y-6">
            <BuyerPanel streamId={streamId} productId={productId} />
          </div>
        </div>

        <div className="p-4 text-sm text-gray-600 bg-white border rounded">
          <p>Note: This demo simulates a live stream discount window. Video streaming can be integrated later via third-party providers (Mux, Livepeer, Agora). The discount is only applied while the stream is active.</p>
        </div>
      </div>

      <style>{`
        .btn { @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded; }
        .input { @apply w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400; }
      `}</style>
    </div>
  )
}

export default App
