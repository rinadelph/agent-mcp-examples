-- Sample data for 925 Silver LLC E-commerce
-- This script inserts sample products for testing purposes

-- Clear existing sample data (optional - remove in production)
-- DELETE FROM public.order_items;
-- DELETE FROM public.orders;
-- DELETE FROM public.products;

-- Insert sample products
INSERT INTO public.products (name, description, category, price, quantity, image_url, is_featured, is_active) VALUES
-- Rings
('Classic Silver Band Ring', 'Timeless 925 sterling silver band ring with polished finish. Width: 4mm. Perfect for everyday wear or as a wedding band.', 'Rings', 45.00, 25, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', true, true),
('Celtic Knot Ring', 'Intricate Celtic knot design in 925 sterling silver. Symbolizes eternal love and friendship. Available in sizes 5-12.', 'Rings', 68.00, 15, 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800', false, true),
('Birthstone Ring - Sapphire', '925 sterling silver ring featuring a genuine blue sapphire. September birthstone. Elegant setting with side accents.', 'Rings', 125.00, 8, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800', true, true),
('Stackable Silver Rings Set', 'Set of 3 delicate 925 sterling silver stackable rings. Mix and match for a personalized look. Each ring is 2mm wide.', 'Rings', 75.00, 20, 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800', false, true),

-- Necklaces
('Silver Heart Pendant Necklace', 'Delicate 925 sterling silver heart pendant on an 18-inch chain. Perfect gift for loved ones. Lobster clasp closure.', 'Necklaces', 55.00, 30, 'https://images.unsplash.com/photo-1599462756439-84a45356e72e?w=800', true, true),
('Cross Pendant with Chain', '925 sterling silver cross pendant (1.5 inches) on a 20-inch box chain. Faith-inspired jewelry for everyday wear.', 'Necklaces', 65.00, 18, 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800', false, true),
('Infinity Symbol Necklace', 'Modern infinity symbol pendant in polished 925 sterling silver. 16-inch chain with 2-inch extender. Represents eternal love.', 'Necklaces', 48.00, 25, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800', false, true),
('Personalized Name Necklace', 'Custom 925 sterling silver name necklace. Up to 10 characters. Choose from script or block font. 18-inch chain included.', 'Necklaces', 89.00, 12, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800', true, true),

-- Bracelets
('Silver Chain Bracelet', 'Classic 925 sterling silver chain bracelet. 7.5 inches with secure lobster clasp. Suitable for charms. 5mm width.', 'Bracelets', 85.00, 22, 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800', false, true),
('Bangle Bracelet Set', 'Set of 3 925 sterling silver bangle bracelets. Different textures: smooth, hammered, and twisted. 2.5-inch diameter.', 'Bracelets', 120.00, 10, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800', true, true),
('Tennis Bracelet', 'Elegant 925 sterling silver tennis bracelet with cubic zirconia. 7 inches with safety clasp. Perfect for special occasions.', 'Bracelets', 145.00, 6, 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800', false, true),
('Charm Bracelet Starter', '925 sterling silver charm bracelet with 3 starter charms: heart, star, and moon. Add more charms to personalize.', 'Bracelets', 95.00, 15, 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800', false, true),

-- Earrings
('Silver Stud Earrings', 'Classic 925 sterling silver ball stud earrings. 6mm diameter. Butterfly backs. Perfect for everyday wear.', 'Earrings', 25.00, 40, 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800', false, true),
('Hoop Earrings - Medium', '925 sterling silver hoop earrings. 30mm diameter, 3mm thickness. Secure click-top closure. Versatile and stylish.', 'Earrings', 42.00, 28, 'https://images.unsplash.com/photo-1588444650733-d0767b753fc8?w=800', true, true),
('Dangle Pearl Earrings', 'Elegant 925 sterling silver earrings with freshwater pearl drops. 1.5-inch total length. Lever-back closure.', 'Earrings', 58.00, 18, 'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?w=800', false, true),
('Crystal Drop Earrings', 'Sparkling Swarovski crystal drop earrings in 925 sterling silver settings. Perfect for weddings and formal events.', 'Earrings', 78.00, 12, 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800', true, true),

-- Anklets
('Simple Silver Anklet', 'Delicate 925 sterling silver anklet with adjustable length (9-10 inches). Features small bell charm. Summer essential.', 'Anklets', 35.00, 20, 'https://images.unsplash.com/photo-1625794084867-8ddd239946b1?w=800', false, true),
('Beaded Anklet', '925 sterling silver anklet with alternating silver beads and spacers. 10 inches with 1-inch extender.', 'Anklets', 45.00, 15, 'https://images.unsplash.com/photo-1602836948295-14b195efa63d?w=800', false, true),

-- Sets
('Bridal Jewelry Set', 'Complete 925 sterling silver bridal set: necklace, earrings, and bracelet with cubic zirconia. Comes in elegant gift box.', 'Sets', 225.00, 5, 'https://images.unsplash.com/photo-1556955112-28cde3817b0a?w=800', true, true),
('Mother-Daughter Set', 'Matching 925 sterling silver heart necklaces for mother and daughter. Two sizes: 18-inch and 14-inch chains.', 'Sets', 110.00, 8, 'https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=800', false, true),

-- Men''s Jewelry
('Men''s Silver Chain Necklace', 'Heavy-duty 925 sterling silver chain for men. 22 inches, 6mm width. Figaro link style. Lobster clasp.', 'Mens', 125.00, 15, 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800', false, true),
('Men''s Signet Ring', 'Classic men''s 925 sterling silver signet ring. Can be engraved with initials. Available in sizes 8-13.', 'Mens', 95.00, 10, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', false, true),
('Men''s Leather Bracelet', '925 sterling silver clasps with genuine black leather band. Magnetic closure. 8.5 inches. Modern masculine style.', 'Mens', 68.00, 18, 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800', true, true),

-- Children''s Jewelry
('Children''s Butterfly Necklace', 'Adorable 925 sterling silver butterfly pendant on 14-inch chain. Safe for sensitive skin. Perfect for ages 3-10.', 'Children', 32.00, 25, 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800', false, true),
('Baby''s First Bracelet', '925 sterling silver baby bracelet with heart charm. Adjustable 4-5 inches. Comes with gift box and certificate.', 'Children', 45.00, 20, 'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?w=800', false, true);

-- Note: In production, image URLs should point to your actual product images stored in Supabase Storage
-- The Unsplash URLs above are placeholders for demonstration purposes