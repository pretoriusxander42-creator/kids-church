import { PageTransition } from '@/components/PageTransition';
import { MenuItemCard } from '@/components/MenuItemCard';

interface MenuItem {
  _id: string;
  title: string;
  price: number;
  description: string;
  tags?: string[];
}

interface MenuCategory {
  _id: string;
  name: string;
}

interface MenuSection {
  category: MenuCategory;
  items: MenuItem[];
}

// Fetch menu data from API
async function getMenuData(): Promise<MenuSection[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/menu`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!res.ok) {
      throw new Error('Failed to fetch menu');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching menu:', error);
    return [];
  }
}

export default async function MenuPage() {
  const menuData = await getMenuData();

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-serif text-center mb-4 text-accent-gold">
          Our Menu
        </h1>
        <p className="text-center text-text-secondary mb-12 max-w-2xl mx-auto">
          Discover our carefully curated selection of dishes, each crafted with
          passion and the finest ingredients
        </p>

        {menuData.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary text-lg">
              Menu coming soon. Please check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {menuData.map((section) => (
              <section key={section.category._id}>
                <h2 className="text-3xl font-serif text-accent-gold mb-8">
                  {section.category.name}
                </h2>

                {section.items.length === 0 ? (
                  <p className="text-text-secondary">
                    No items available in this category.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.items.map((item) => (
                      <MenuItemCard
                        key={item._id}
                        title={item.title}
                        price={item.price}
                        description={item.description}
                        tags={item.tags}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
