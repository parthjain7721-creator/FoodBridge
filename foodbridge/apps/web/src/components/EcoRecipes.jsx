import React, { useState } from 'react';
import { ChefHat, Info, Sparkles } from 'lucide-react';

const EcoRecipes = () => {
  const [ingredients, setIngredients] = useState('');
  const [servings, setServings] = useState('50');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipe, setRecipe] = useState(null);

  const handleGenerate = () => {
    if(!ingredients) return;
    setIsGenerating(true);
    setRecipe(null);

    setTimeout(() => {
      setIsGenerating(false);
      setRecipe({
        title: 'Mixed Veggie Pasta Bake',
        allocations: '15kg Pasta, 5kg Mixed Veggies, 2kg Cheese',
        allergens: 'Contains Gluten, Dairy. Trace amounts of Soy.',
        instructions: [
          'Preheat commercial ovens to 200°C.',
          'Boil pasta in large vats until al dente.',
          'Mix chopped vegetables with tomato base.',
          'Combine pasta and sauce, top with cheese, and bake for 25 mins.'
        ]
      });
    }, 2000);
  };

  return (
    <div className="animate-slide-in" style={{ display: 'flex', gap: '2rem' }}>
      
      <div className="glass-card" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-primary)' }}>
          <ChefHat size={28} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>AI EcoRecipes</h2>
        </div>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Select ingredients from your claimed food basket, specify servings, and generate bulk recipes instantly.
        </p>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Ingredients (Claimed Food)</label>
          <textarea 
            rows={4}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="E.g., 15kg raw pasta, 5kg mixed surplus vegetables, 2kg cheese"
            style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white', outline: 'none', resize: 'none' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Number of Servings</label>
          <input 
            type="number"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
          />
        </div>

        <button className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem' }} onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? <Sparkles className="animate-spin" /> : <ChefHat />} 
          {isGenerating ? 'Generating Recipe...' : 'Generate Bulk Recipe'}
        </button>
      </div>

      <div style={{ flex: 1 }}>
        {recipe ? (
          <div className="glass-panel animate-slide-in" style={{ padding: '2rem', height: '100%' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>{recipe.title}</h3>
            
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Info color="var(--color-highlight)" size={20} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ color: 'var(--color-highlight)', fontWeight: 600, marginBottom: '0.25rem' }}>Allergen Warnings</div>
                <div style={{ fontSize: '0.9rem' }}>{recipe.allergens}</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Portion Allocations</h4>
              <p style={{ fontWeight: 500 }}>{recipe.allocations}</p>
            </div>

            <div>
              <h4 style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Preparation Steps</h4>
              <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recipe.instructions.map((step, idx) => (
                  <li key={idx} style={{ paddingLeft: '0.5rem' }}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', padding: '2rem', textAlign: 'center' }}>
            Enter ingredients on the left to generate an AI recipe tailored to your shelter's needs.
          </div>
        )}
      </div>

    </div>
  );
};

export default EcoRecipes;
