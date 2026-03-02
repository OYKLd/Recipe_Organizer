class RecipeOrganizer {
    constructor() {
        this.recipes = [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.editingRecipeId = null;
        this.init();
    }

    init() {
        this.loadRecipes();
        this.loadTheme();
        this.setupEventListeners();
        this.renderRecipes();
    }

    // Gestion du LocalStorage
    loadRecipes() {
        const savedRecipes = localStorage.getItem('recipes');
        if (savedRecipes) {
            this.recipes = JSON.parse(savedRecipes);
        } else {
            // Ajouter quelques recettes d'exemple
            this.recipes = [];
            this.saveRecipes();
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.updateThemeToggle(true);
        }
    }

    saveTheme(isDark) {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    saveRecipes() {
        localStorage.setItem('recipes', JSON.stringify(this.recipes));
    }

    // Configuration des écouteurs d'événements
    setupEventListeners() {
        // Bouton ajouter une recette
        document.getElementById('addRecipeBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Bouton thème
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Modal formulaire
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('recipeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRecipe();
        });

        // Modal détails
        document.getElementById('closeDetailModal').addEventListener('click', () => {
            this.closeDetailModal();
        });

        // Recherche
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentSearch = e.target.value.toLowerCase();
            this.renderRecipes();
        });

        document.getElementById('searchBtn').addEventListener('click', () => {
            this.renderRecipes();
        });

        // Filtres
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.category;
                this.renderRecipes();
            });
        });

        // Ajouter ingrédients et étapes
        document.getElementById('addIngredientBtn').addEventListener('click', () => {
            this.addIngredientField();
        });

        document.getElementById('addStepBtn').addEventListener('click', () => {
            this.addStepField();
        });

        // Fermer les modals en cliquant à l'extérieur
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
    }

    // Gestion du thème
    toggleTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        this.updateThemeToggle(!isDark);
        this.saveTheme(!isDark);
    }

    updateThemeToggle(isDark) {
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        themeToggle.title = isDark ? 'Passer au mode clair' : 'Passer au mode sombre';
    }

    // Gestion des modals
    openModal(recipeId = null) {
        const modal = document.getElementById('recipeModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('recipeForm');
        
        // Fermer le modal de détails si il est ouvert
        this.closeDetailModal();

        if (recipeId) {
            const recipe = this.recipes.find(r => r.id === recipeId);
            if (recipe) {
                modalTitle.textContent = 'Modifier la recette';
                this.editingRecipeId = recipeId;
                this.fillForm(recipe);
            }
        } else {
            modalTitle.textContent = 'Ajouter une recette';
            this.editingRecipeId = null;
            form.reset();
            this.resetDynamicFields();
        }

        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('recipeModal').classList.remove('active');
        document.getElementById('recipeForm').reset();
        this.editingRecipeId = null;
        this.resetDynamicFields();
    }

    closeDetailModal() {
        document.getElementById('detailModal').classList.remove('active');
    }

    // Gestion des champs dynamiques
    resetDynamicFields() {
        const ingredientsList = document.getElementById('ingredientsList');
        const stepsList = document.getElementById('stepsList');
        
        ingredientsList.innerHTML = `
            <div class="ingredient-item">
                <input type="text" class="ingredient-input" placeholder="ex: 200g de farine" required>
                <button type="button" class="remove-ingredient-btn">×</button>
            </div>
        `;
        
        stepsList.innerHTML = `
            <div class="step-item">
                <textarea class="step-input" placeholder="Décrivez l'étape de préparation..." required></textarea>
                <button type="button" class="remove-step-btn">×</button>
            </div>
        `;
        
        this.attachDynamicFieldListeners();
    }

    addIngredientField() {
        const ingredientsList = document.getElementById('ingredientsList');
        const ingredientItem = document.createElement('div');
        ingredientItem.className = 'ingredient-item';
        ingredientItem.innerHTML = `
            <input type="text" class="ingredient-input" placeholder="ex: 200g de farine" required>
            <button type="button" class="remove-ingredient-btn">×</button>
        `;
        ingredientsList.appendChild(ingredientItem);
        this.attachDynamicFieldListeners();
    }

    addStepField() {
        const stepsList = document.getElementById('stepsList');
        const stepItem = document.createElement('div');
        stepItem.className = 'step-item';
        stepItem.innerHTML = `
            <textarea class="step-input" placeholder="Décrivez l'étape de préparation..." required></textarea>
            <button type="button" class="remove-step-btn">×</button>
        `;
        stepsList.appendChild(stepItem);
        this.attachDynamicFieldListeners();
    }

    attachDynamicFieldListeners() {
        document.querySelectorAll('.remove-ingredient-btn').forEach(btn => {
            btn.onclick = () => {
                if (document.querySelectorAll('.ingredient-item').length > 1) {
                    btn.parentElement.remove();
                }
            };
        });

        document.querySelectorAll('.remove-step-btn').forEach(btn => {
            btn.onclick = () => {
                if (document.querySelectorAll('.step-item').length > 1) {
                    btn.parentElement.remove();
                }
            };
        });
    }

    // Remplir le formulaire pour l'édition
    fillForm(recipe) {
        document.getElementById('recipeTitle').value = recipe.title;
        document.getElementById('recipeCategory').value = recipe.category;
        document.getElementById('recipeImage').value = recipe.image || '';
        document.getElementById('recipeTime').value = recipe.time || '';

        // Remplir les ingrédients
        const ingredientsList = document.getElementById('ingredientsList');
        ingredientsList.innerHTML = '';
        recipe.ingredients.forEach(ingredient => {
            const ingredientItem = document.createElement('div');
            ingredientItem.className = 'ingredient-item';
            ingredientItem.innerHTML = `
                <input type="text" class="ingredient-input" value="${ingredient}" required>
                <button type="button" class="remove-ingredient-btn">×</button>
            `;
            ingredientsList.appendChild(ingredientItem);
        });

        // Remplir les étapes
        const stepsList = document.getElementById('stepsList');
        stepsList.innerHTML = '';
        recipe.steps.forEach(step => {
            const stepItem = document.createElement('div');
            stepItem.className = 'step-item';
            stepItem.innerHTML = `
                <textarea class="step-input" required>${step}</textarea>
                <button type="button" class="remove-step-btn">×</button>
            `;
            stepsList.appendChild(stepItem);
        });

        this.attachDynamicFieldListeners();
    }

    // Sauvegarder une recette
    saveRecipe() {
        const formData = new FormData(document.getElementById('recipeForm'));
        
        // Récupérer les ingrédients
        const ingredients = Array.from(document.querySelectorAll('.ingredient-input'))
            .map(input => input.value.trim())
            .filter(value => value !== '');

        // Récupérer les étapes
        const steps = Array.from(document.querySelectorAll('.step-input'))
            .map(textarea => textarea.value.trim())
            .filter(value => value !== '');

        const recipe = {
            id: this.editingRecipeId || Date.now(),
            title: formData.get('title'),
            category: formData.get('category'),
            image: formData.get('image') || '',
            time: formData.get('time') || '',
            ingredients: ingredients,
            steps: steps,
            favorite: false,
            createdAt: this.editingRecipeId ? 
                this.recipes.find(r => r.id === this.editingRecipeId).createdAt : 
                new Date().toISOString()
        };

        let wasEditing = false;
        if (this.editingRecipeId) {
            wasEditing = true;
            const index = this.recipes.findIndex(r => r.id === this.editingRecipeId);
            if (index !== -1) {
                this.recipes[index] = { ...this.recipes[index], ...recipe };
            }
        } else {
            this.recipes.unshift(recipe);
        }

        this.saveRecipes();
        this.renderRecipes();
        this.closeModal();
        
        // Si on était en train d'éditer, réouvrir le modal de détails
        if (wasEditing) {
            this.showRecipeDetails(this.editingRecipeId);
        }
    }

    // Supprimer une recette
    deleteRecipe(recipeId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
            this.recipes = this.recipes.filter(r => r.id !== recipeId);
            this.saveRecipes();
            this.renderRecipes();
        }
    }

    // Gérer les favoris
    toggleFavorite(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (recipe) {
            recipe.favorite = !recipe.favorite;
            this.saveRecipes();
            this.renderRecipes();
        }
    }

    // Afficher les détails d'une recette
    showRecipeDetails(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const modal = document.getElementById('detailModal');
        const title = document.getElementById('detailTitle');
        const content = document.getElementById('detailContent');

        title.textContent = recipe.title;

        content.innerHTML = `
            <div class="recipe-detail-header">
                <div class="recipe-detail-image">
                    ${recipe.image ? 
                        `<img src="${recipe.image}" alt="${recipe.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" onerror="this.style.display='none'; this.parentElement.innerHTML='🍽️';">` : 
                        '🍽️'
                    }
                </div>
                <div class="recipe-detail-info">
                    <div class="recipe-detail-meta">
                        <span class="recipe-card-category">${this.getCategoryLabel(recipe.category)}</span>
                        ${recipe.time ? `<span class="recipe-card-time">Temps: ${recipe.time}</span>` : ''}
                        <button class="favorite-btn ${recipe.favorite ? 'active' : ''}" onclick="app.toggleFavorite(${recipe.id}); app.showRecipeDetails(${recipe.id});">
                            ${recipe.favorite ? '❤️' : '🤍'}
                        </button>
                    </div>
                </div>
            </div>

            <div class="recipe-detail-section">
                <h3>Ingrédients</h3>
                <ul class="ingredients-list">
                    ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
            </div>

            <div class="recipe-detail-section">
                <h3>Étapes de préparation</h3>
                <ol class="steps-list">
                    ${recipe.steps.map((step, index) => `<li data-step="${index + 1}">${step}</li>`).join('')}
                </ol>
            </div>

            <div class="form-actions">
                <button class="btn btn-secondary" onclick="app.openModal(${recipe.id})">Modifier</button>
                <button class="btn btn-primary" onclick="app.deleteRecipe(${recipe.id}); app.closeDetailModal();">🗑️ Supprimer</button>
            </div>
        `;

        modal.classList.add('active');
    }

    // Obtenir le label de catégorie
    getCategoryLabel(category) {
        const labels = {
            'plat': 'Plat',
            'dessert': 'Dessert',
            'boisson': 'Boisson',
            'entree': 'Entrée'
        };
        return labels[category] || category;
    }

    // Filtrer et rechercher les recettes
    getFilteredRecipes() {
        let filtered = this.recipes;

        // Filtrer par catégorie
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(recipe => recipe.category === this.currentFilter);
        }

        // Filtrer par recherche
        if (this.currentSearch) {
            filtered = filtered.filter(recipe => 
                recipe.title.toLowerCase().includes(this.currentSearch) ||
                recipe.ingredients.some(ing => ing.toLowerCase().includes(this.currentSearch))
            );
        }

        return filtered;
    }

    // Rendre les recettes dans la grille
    renderRecipes() {
        const grid = document.getElementById('recipesGrid');
        const emptyState = document.getElementById('emptyState');
        const filteredRecipes = this.getFilteredRecipes();

        if (filteredRecipes.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        grid.innerHTML = filteredRecipes.map(recipe => `
            <div class="recipe-card" onclick="app.showRecipeDetails(${recipe.id})">
                <div class="recipe-card-image">
                    ${recipe.image ? 
                        `<img src="${recipe.image}" alt="${recipe.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='🍽️';">` : 
                        '🍽️'
                    }
                </div>
                <div class="recipe-card-content">
                    <h3 class="recipe-card-title">${recipe.title}</h3>
                    <span class="recipe-card-category">${this.getCategoryLabel(recipe.category)}</span>
                    ${recipe.time ? `<div class="recipe-card-time">Temps: ${recipe.time}</div>` : ''}
                    <div class="recipe-card-actions">
                        <button class="card-action-btn favorite-btn ${recipe.favorite ? 'active' : ''}" 
                                onclick="event.stopPropagation(); app.toggleFavorite(${recipe.id})" 
                                title="${recipe.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
                            ${recipe.favorite ? '❤️' : '🤍'}
                        </button>
                        <button class="card-action-btn delete-btn" 
                                onclick="event.stopPropagation(); app.deleteRecipe(${recipe.id})" 
                                title="Supprimer la recette">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Initialiser l'application
const app = new RecipeOrganizer();
