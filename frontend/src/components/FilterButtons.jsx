import { Link } from "react-router-dom";

export default function FilterButtons({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="filter-buttons" style={{ 
      display: "flex", 
      gap: "8px", 
      marginBottom: "20px", 
      overflowX: "auto",
      padding: "10px 0"
    }}>
      {categories.map((cat) => (
        <Link
          key={cat}
          to={`/category/${encodeURIComponent(cat.toLowerCase())}`}
          className={cat === selectedCategory ? "active" : ""}
          style={{
            padding: "8px 16px",
            backgroundColor: cat === selectedCategory ? "#FF0000" : "#f2f2f2",
            color: cat === selectedCategory ? "#fff" : "#333",
            textDecoration: "none",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: cat === selectedCategory ? "bold" : "normal",
            whiteSpace: "nowrap",
            border: "1px solid transparent",
            transition: "all 0.2s ease"
          }}
          onClick={(e) => {
            if (onSelectCategory) {
              e.preventDefault();
              onSelectCategory(cat);
            }
          }}
        >
          {cat}
        </Link>
      ))}
    </div>
  );
}