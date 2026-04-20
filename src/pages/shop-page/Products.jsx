import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { fetchProducts } from "../../features/product/product-slice";
import { useSearchParams, useNavigate } from "react-router-dom";
import style from "./Products.module.scss";
import { buildProductImageUrl } from "../../utils/imageUtils";

function Products() {
  const loaderRef = useRef(null);
  const dispatch = useDispatch();
  const isFirstLoad = useRef(true);
  const allCategoriesRef = useRef(new Set());
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const products = useSelector((state) => state.product.products);
  const { hasMore, cursor, loading } = useSelector((state) => state.product);

  // ✅ Read initial values FROM URL (handles refresh/share)
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(
    () => searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get("category") || "",
  );
  const [minPrice, setMinPrice] = useState(
    () => searchParams.get("minPrice") || "",
  );
  const [maxPrice, setMaxPrice] = useState(
    () => searchParams.get("maxPrice") || "",
  );
  const [sortBy, setSortBy] = useState(
    () => searchParams.get("sort") || "newest",
  );
  const [categoryList, setCategoryList] = useState([]);

  // ✅ Update all categories when products load (fresh search only)
  useEffect(() => {
    products.forEach((product) => {
      if (product.category) {
        allCategoriesRef.current.add(product.category);
      }
    });
    const sorted = Array.from(allCategoriesRef.current)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    setCategoryList(sorted);
  }, [products]);

  // ✅ Use categoryList for dropdown options
  const categoryOptions = categoryList;

  // ✅ Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ✅ Sync state → URL
  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedCategory) params.category = selectedCategory;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (sortBy !== "newest") params.sort = sortBy;

    setSearchParams(params, { replace: true });
  }, [
    debouncedSearch,
    selectedCategory,
    minPrice,
    maxPrice,
    sortBy,
    setSearchParams,
  ]);

  // ✅ Fetch from backend when filters change (reset pagination)
  useEffect(() => {
    isFirstLoad.current = true;
    dispatch(
      fetchProducts({
        cursor: null,
        filters: {
          search: debouncedSearch.trim(),
          category: selectedCategory,
          minPrice,
          maxPrice,
          sort: sortBy,
        },
      }),
    );
  }, [dispatch, debouncedSearch, selectedCategory, minPrice, maxPrice, sortBy]);

  // ✅ Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (isFirstLoad.current) {
          isFirstLoad.current = false;
          return;
        }

        if (firstEntry.isIntersecting && hasMore && !loading) {
          dispatch(
            fetchProducts({
              cursor,
              filters: {
                search: debouncedSearch.trim(),
                category: selectedCategory,
                minPrice,
                maxPrice,
                sort: sortBy,
              },
            }),
          );
        }
      },
      { threshold: 0.5 },
    );

    const currentRef = loaderRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [
    dispatch,
    hasMore,
    cursor,
    loading,
    debouncedSearch,
    selectedCategory,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  return (
    <section className={style.SectionProducts}>
      <h1>All Products</h1>

      <div className={style.filterBar}>
        {/* Search */}
        <input
          className={style.filterInput}
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Category Select */}
        <select
          className={style.filterInput}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* Min Price */}
        <input
          className={style.filterInput}
          type="number"
          min="0"
          placeholder="Min price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />

        {/* Max Price */}
        <input
          className={style.filterInput}
          type="number"
          min="0"
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        {/* Sort — values match backend getSortConfig() exactly */}
        <select
          className={style.filterInput}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="lowtohigh">Price: Low to High</option>
          <option value="hightolow">Price: High to Low</option>
          <option value="az">Title: A to Z</option>
          <option value="za">Title: Z to A</option>
        </select>
      </div>

      <div className={style.cardContainer}>
        {products.map((product) => (
          <div className={style.productCard} key={product._id}>
            <div className={style.productImage}>
              {product.images && product.images.length > 0 ? (
                <img
                  src={buildProductImageUrl(product.images[0])}
                  alt={product.title}
                  width="320"
                  height="280"
                  loading="lazy"
                />
              ) : null}
            </div>
            <div className={style.productInfo}>
              <h2 onClick={() => handleProductClick(product._id)}>
                {product.title || product.name}
              </h2>
              <p>{product.description}</p>
            </div>
          </div>
        ))}

        {products.length === 0 && !loading && (
          <p>No matching products found.</p>
        )}

        {loading && <p>Loading...</p>}

        <div ref={loaderRef} className={style.loader}></div>
      </div>
    </section>
  );
}

export default Products;
