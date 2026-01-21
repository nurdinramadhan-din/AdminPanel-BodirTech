import React, { useState } from "react";
import { useList, useCreate, useGetIdentity } from "@refinedev/core";
import { Input, Card, Button, Table, Row, Col, message, Modal, InputNumber, Badge } from "antd";
import { ShoppingCartOutlined, DeleteOutlined, SaveOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";

// Interface User Identity
type IUserIdentity = {
    id: string;
    organization_id: string; // Tambahkan properti ini
};

export const POSPage = () => {
    const { data: user } = useGetIdentity<IUserIdentity>();
    const [cart, setCart] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

    // 1. Ambil Data Produk & Stok Toko
    // Kita join manual di frontend atau buat view khusus nanti. Untuk sekarang ambil products dulu.
    const { data: productsData, isLoading } = useList({
        resource: "products",
        pagination: { mode: "off" },
    });

    // 2. Fungsi Tambah ke Keranjang
    const addToCart = (product: any) => {
        const exist = cart.find((item) => item.id === product.id);
        if (exist) {
            setCart(cart.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    // 3. Fungsi Ubah Qty
    const updateQty = (id: string, val: number) => {
        if (val <= 0) {
            setCart(cart.filter((item) => item.id !== id));
        } else {
            setCart(cart.map((item) => item.id === id ? { ...item, qty: val } : item));
        }
    };

    // 4. Hitung Total
    const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    // 5. Checkout (Simpan ke DB)
    const { mutate: createTransaction } = useCreate();
    const { mutate: createItems } = useCreate();

    const handleCheckout = () => {
        if (cart.length === 0) return message.error("Keranjang kosong!");
        setIsCheckoutLoading(true);

        // A. Buat Transaksi Header
        createTransaction({
            resource: "pos_transactions",
            values: {
                organization_id: user?.organization_id, // Pastikan field ini ada di identity Anda
                cashier_id: user?.id,
                total_amount: totalAmount,
                status: 'PAID',
                payment_method: 'CASH' 
            }
        }, {
            onSuccess: (data) => {
                const transId = data.data.id;
                
                // B. Buat Item Transaksi (Looping)
                // Tips: Di real production, gunakan 'createMany' jika provider mendukung, atau loop.
                const itemsPayload = cart.map(item => ({
                     transaction_id: transId,
                     product_id: item.id,
                     qty: item.qty,
                     price_per_unit: item.price,
                     subtotal: item.price * item.qty
                }));

                // Kita asumsikan create many support, kalau tidak loop satu2
                itemsPayload.forEach(payload => {
                    createItems({
                        resource: "pos_transaction_items",
                        values: payload
                    });
                });

                message.success("Transaksi Berhasil!");
                setCart([]);
                setIsCheckoutLoading(false);
            },
            onError: (err) => {
                console.error(err);
                message.error("Gagal memproses transaksi.");
                setIsCheckoutLoading(false);
            }
        });
    };

    // Filter Produk
    const filteredProducts = productsData?.data?.filter((p:any) => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row gap-4 p-4 bg-slate-900 text-slate-200">
            {/* BAGIAN KIRI: DAFTAR PRODUK */}
            <div className="flex-1 overflow-y-auto pr-2">
                <Input 
                    placeholder="Cari Produk..." 
                    prefix={<ShoppingCartOutlined />} 
                    className="mb-4 bg-slate-800 border-slate-700 text-white"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredProducts.map((product: any) => (
                        <Card 
                            key={product.id}
                            hoverable
                            className="bg-slate-800 border-slate-700"
                            styles={{ body: { padding: '12px' } }}
                            onClick={() => addToCart(product)}
                        >
                            <div className="text-center">
                                {/* Placeholder Gambar */}
                                <div className="h-24 bg-slate-700 rounded mb-2 flex items-center justify-center text-slate-500">
                                    IMG
                                </div>
                                <h4 className="font-bold text-white truncate">{product.name}</h4>
                                <p className="text-emerald-400 font-bold">Rp {Number(product.price).toLocaleString('id-ID')}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* BAGIAN KANAN: KERANJANG (CART) */}
            <div className="w-full md:w-96 bg-slate-800 rounded-xl p-4 flex flex-col border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <ShoppingCartOutlined /> Keranjang
                </h3>
                
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 scrollbar-thin scrollbar-thumb-slate-600">
                    {cart.length === 0 ? (
                        <p className="text-center text-slate-500 mt-10">Belum ada item.</p>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white truncate">{item.name}</p>
                                    <p className="text-xs text-slate-400">@ {item.price.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="small" icon={<MinusOutlined />} onClick={() => updateQty(item.id, item.qty - 1)} />
                                    <span className="text-white w-6 text-center">{item.qty}</span>
                                    <Button size="small" icon={<PlusOutlined />} onClick={() => updateQty(item.id, item.qty + 1)} />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="border-t border-slate-700 pt-4">
                    <div className="flex justify-between text-lg font-bold text-white mb-4">
                        <span>Total</span>
                        <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <Button 
                        type="primary" 
                        size="large" 
                        block 
                        loading={isCheckoutLoading}
                        onClick={handleCheckout}
                        className="bg-emerald-600 hover:bg-emerald-500 font-bold h-12"
                    >
                        BAYAR SEKARANG
                    </Button>
                </div>
            </div>
        </div>
    );
};