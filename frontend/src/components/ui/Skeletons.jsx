export function ProductCardSkeleton() {
    return (
        <div className="skeleton-card">
            <div className="skeleton skeleton--img" />
            <div style={{ padding: '12px 0 0' }}>
                <div className="skeleton skeleton--text" style={{ width: '45%', height: 10, marginBottom: 8 }} />
                <div className="skeleton skeleton--title" style={{ width: '90%', marginBottom: 6 }} />
                <div className="skeleton skeleton--text" style={{ width: '50%', marginBottom: 12 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 4 }} />
                    <div className="skeleton" style={{ width: 56, height: 28, borderRadius: 8 }} />
                </div>
            </div>
        </div>
    );
}

export function ProductGridSkeleton({ count = 8 }) {
    return (
        <div className="product-grid">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function CartItemSkeleton() {
    return (
        <div className="cart-item" style={{ opacity: 0.7 }}>
            <div className="skeleton" style={{ width: 88, height: 88, borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <div className="skeleton skeleton--title" style={{ marginBottom: 6 }} />
                <div className="skeleton skeleton--text" style={{ width: '40%', marginBottom: 16 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="skeleton" style={{ width: 96, height: 32, borderRadius: 8 }} />
                    <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 4 }} />
                </div>
            </div>
        </div>
    );
}

export function DetailSkeleton() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, padding: '24px 0' }}>
            <div className="skeleton skeleton--img" style={{ borderRadius: 20 }} />
            <div>
                <div className="skeleton" style={{ width: '30%', height: 12, marginBottom: 12 }} />
                <div className="skeleton" style={{ width: '80%', height: 28, marginBottom: 8 }} />
                <div className="skeleton skeleton--text" style={{ width: '50%', marginBottom: 20 }} />
                <div className="skeleton" style={{ width: '35%', height: 36, marginBottom: 20 }} />
                <div className="skeleton" style={{ width: '100%', height: 80, borderRadius: 16, marginBottom: 20 }} />
                <div className="skeleton" style={{ width: '100%', height: 14, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: '90%', height: 14, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: '70%', height: 14 }} />
            </div>
        </div>
    );
}
