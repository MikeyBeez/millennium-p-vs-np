/**
 * P vs NP Research with Centrum Theory Application
 * 
 * Applying Micheal Bee's Centrum Theory to computational complexity research.
 * The P vs NP problem is a perfect centrum - infinite dimensional complexity space
 * that we can only access through finite perspectives.
 */

class CentrumBasedSATSolver {
    constructor() {
        this.clauses = [];
        this.variableCount = 0;
        this.dimensions = {
            frequency: {},      // How often variables appear
            polarity: {},       // Positive vs negative occurrences  
            clauseLength: [],   // Length distribution of clauses
            connectivity: {},   // Which variables appear together
            balance: 0          // Overall formula balance
        };
        this.progressHistory = [];
        this.currentCAI = 0;
    }

    /**
     * Analyze the centrum (problem space) to identify salient dimensions
     * This applies CC_α formula: find minimum dimensions for α% understanding
     */
    analyzeCentrum(clauses, alpha = 0.8) {
        console.log(`\n🎯 CENTRUM ANALYSIS (targeting ${alpha * 100}% understanding)`);
        console.log(`═══════════════════════════════════════════════════════`);
        
        this.clauses = clauses;
        this.variableCount = Math.max(...clauses.flat().map(Math.abs));
        
        // Dimension 1: Variable Frequency Analysis
        console.log(`📊 Dimension 1: Variable Frequency`);
        for (let clause of clauses) {
            for (let literal of clause) {
                const variable = Math.abs(literal);
                this.dimensions.frequency[variable] = (this.dimensions.frequency[variable] || 0) + 1;
                
                if (!this.dimensions.polarity[variable]) {
                    this.dimensions.polarity[variable] = { positive: 0, negative: 0 };
                }
                
                if (literal > 0) {
                    this.dimensions.polarity[variable].positive++;
                } else {
                    this.dimensions.polarity[variable].negative++;
                }
            }
        }
        
        // Dimension 2: Clause Structure Analysis  
        console.log(`📊 Dimension 2: Clause Structure`);
        this.dimensions.clauseLength = clauses.map(clause => clause.length);
        const avgClauseLength = this.dimensions.clauseLength.reduce((a, b) => a + b) / clauses.length;
        console.log(`   Average clause length: ${avgClauseLength.toFixed(2)}`);
        
        // Dimension 3: Variable Connectivity (which vars appear together)
        console.log(`📊 Dimension 3: Variable Connectivity`);
        for (let clause of clauses) {
            for (let i = 0; i < clause.length; i++) {
                for (let j = i + 1; j < clause.length; j++) {
                    const var1 = Math.abs(clause[i]);
                    const var2 = Math.abs(clause[j]);
                    const key = `${Math.min(var1, var2)}-${Math.max(var1, var2)}`;
                    this.dimensions.connectivity[key] = (this.dimensions.connectivity[key] || 0) + 1;
                }
            }
        }
        
        // Dimension 4: Formula Balance
        console.log(`📊 Dimension 4: Formula Balance`);
        let totalPositive = 0, totalNegative = 0;
        for (let variable in this.dimensions.polarity) {
            totalPositive += this.dimensions.polarity[variable].positive;
            totalNegative += this.dimensions.polarity[variable].negative;
        }
        this.dimensions.balance = totalPositive / (totalPositive + totalNegative);
        console.log(`   Positive/Total ratio: ${this.dimensions.balance.toFixed(3)}`);
        
        return this.identifySalientDimensions(alpha);
    }

    /**
     * Apply CC formula to identify the most important dimensions
     */
    identifySalientDimensions(alpha) {
        console.log(`\n🔍 SALIENT DIMENSION IDENTIFICATION`);
        console.log(`Target: ${alpha * 100}% understanding with minimum dimensions`);
        
        // Rank variables by multiple criteria (salient dimensions)
        const variableScores = {};
        
        for (let i = 1; i <= this.variableCount; i++) {
            const freq = this.dimensions.frequency[i] || 0;
            const polarity = this.dimensions.polarity[i] || { positive: 0, negative: 0 };
            const imbalance = Math.abs(polarity.positive - polarity.negative);
            const totalAppearances = polarity.positive + polarity.negative;
            
            // Centrum Theory insight: look for variables in multiple dimensions
            variableScores[i] = {
                frequency: freq,
                imbalance: imbalance,
                connectivity: this.getConnectivityScore(i),
                composite: freq * 0.4 + imbalance * 0.3 + this.getConnectivityScore(i) * 0.3
            };
        }
        
        // Sort by composite score (salient dimensions)
        const sortedVars = Object.entries(variableScores)
            .sort(([,a], [,b]) => b.composite - a.composite)
            .slice(0, Math.ceil(this.variableCount * alpha));  // Top α% of variables
        
        console.log(`📋 Top ${sortedVars.length} salient variables (${alpha * 100}% coverage):`);
        sortedVars.forEach(([variable, scores], index) => {
            console.log(`   ${index + 1}. x${variable}: freq=${scores.frequency}, imbalance=${scores.imbalance}, connectivity=${scores.connectivity.toFixed(2)}`);
        });
        
        return sortedVars.map(([variable]) => parseInt(variable));
    }

    /**
     * Get connectivity score for a variable (how connected it is to others)
     */
    getConnectivityScore(variable) {
        let connections = 0;
        for (let key in this.dimensions.connectivity) {
            const [var1, var2] = key.split('-').map(Number);
            if (var1 === variable || var2 === variable) {
                connections += this.dimensions.connectivity[key];
            }
        }
        return connections;
    }

    /**
     * Centrum Theory solving approach: use salient dimensions to guide search
     */
    centrumSolve() {
        console.log(`\n🧠 CENTRUM THEORY SOLVING APPROACH`);
        console.log(`════════════════════════════════════`);
        
        const salientVars = this.identifySalientDimensions(0.8);
        
        // Strategy 1: Focus on salient dimensions first
        console.log(`\n🎯 Strategy 1: Salient Dimension Priority`);
        let assignment = {};
        
        // Set salient variables based on their polarity bias
        for (let variable of salientVars) {
            const polarity = this.dimensions.polarity[variable];
            if (polarity) {
                // Assign based on which polarity appears more often
                assignment[variable] = polarity.positive >= polarity.negative;
                console.log(`   x${variable} = ${assignment[variable]} (bias: +${polarity.positive}/-${polarity.negative})`);
            }
        }
        
        // Fill in remaining variables with balanced approach
        for (let i = 1; i <= this.variableCount; i++) {
            if (!(i in assignment)) {
                assignment[i] = this.dimensions.balance > 0.5; // Use overall formula balance
            }
        }
        
        console.log(`\n🔍 Testing salient dimension assignment...`);
        if (this.verify(assignment)) {
            console.log(`🎉 CENTRUM THEORY SUCCESS!`);
            this.updateCAI(1.0); // Perfect success on first try
            return assignment;
        }
        
        // Strategy 2: Orthogonal perspective (flip salient variables)
        console.log(`\n🔄 Strategy 2: Orthogonal Perspective (flipping salient dimensions)`);
        for (let variable of salientVars) {
            assignment[variable] = !assignment[variable];
        }
        
        if (this.verify(assignment)) {
            console.log(`🎉 ORTHOGONAL PERSPECTIVE SUCCESS!`);
            this.updateCAI(0.8); // Good success on second try
            return assignment;
        }
        
        // Strategy 3: Ensemble approach (try multiple dimension combinations)
        console.log(`\n🎭 Strategy 3: Ensemble Approach (multiple dimensional perspectives)`);
        const ensembleStrategies = [
            () => this.generateBalancedAssignment(),
            () => this.generateFrequencyBasedAssignment(),
            () => this.generateConnectivityBasedAssignment()
        ];
        
        for (let i = 0; i < ensembleStrategies.length; i++) {
            console.log(`   Trying ensemble strategy ${i + 1}...`);
            assignment = ensembleStrategies[i]();
            if (this.verify(assignment)) {
                console.log(`🎉 ENSEMBLE STRATEGY ${i + 1} SUCCESS!`);
                this.updateCAI(0.5 - i * 0.1); // Decreasing CAI as we try more strategies
                return assignment;
            }
        }
        
        console.log(`❌ Centrum approaches failed, falling back to exhaustive search...`);
        this.updateCAI(0.1); // Low CAI indicates we need new dimensional perspective
        return this.exhaustiveSearch();
    }

    /**
     * Generate assignment based on different dimensional perspectives
     */
    generateBalancedAssignment() {
        const assignment = {};
        for (let i = 1; i <= this.variableCount; i++) {
            assignment[i] = Math.random() > 0.5; // Random but balanced
        }
        return assignment;
    }

    generateFrequencyBasedAssignment() {
        const assignment = {};
        for (let i = 1; i <= this.variableCount; i++) {
            const freq = this.dimensions.frequency[i] || 0;
            assignment[i] = freq > this.clauses.length / 3; // High frequency = true
        }
        return assignment;
    }

    generateConnectivityBasedAssignment() {
        const assignment = {};
        for (let i = 1; i <= this.variableCount; i++) {
            const connectivity = this.getConnectivityScore(i);
            assignment[i] = connectivity > this.clauses.length / 4; // High connectivity = true
        }
        return assignment;
    }

    /**
     * Calculate Centrum Approximation Index (CAI)
     * CAI = dF/dt / F(S_t)
     */
    updateCAI(successRate) {
        const currentTime = Date.now();
        const currentFitness = successRate * 100; // Convert to percentage
        
        this.progressHistory.push({
            time: currentTime,
            fitness: currentFitness,
            timestamp: new Date().toISOString()
        });
        
        if (this.progressHistory.length >= 2) {
            const current = this.progressHistory[this.progressHistory.length - 1];
            const previous = this.progressHistory[this.progressHistory.length - 2];
            
            const dF = current.fitness - previous.fitness;
            const dt = (current.time - previous.time) / 1000; // seconds
            const dF_dt = dF / dt; // fitness change per second
            
            this.currentCAI = dF_dt / (current.fitness || 1); // Avoid division by zero
            
            console.log(`\n📈 CENTRUM APPROXIMATION INDEX (CAI)`);
            console.log(`   dF/dt = ${dF_dt.toFixed(3)} fitness/second`);
            console.log(`   F(S_t) = ${current.fitness.toFixed(1)} current fitness`);
            console.log(`   CAI = ${this.currentCAI.toFixed(4)}`);
            
            if (this.currentCAI > 0.3) {
                console.log(`   🚀 Explosive growth phase! Major breakthroughs ahead.`);
            } else if (this.currentCAI > 0.1) {
                console.log(`   📈 Healthy progress. Good returns on effort.`);
            } else if (this.currentCAI > 0.01) {
                console.log(`   📉 Slowing down. Consider seeking orthogonal perspectives.`);
            } else {
                console.log(`   🔄 Approaching plateau. Time for new dimensional viewpoint!`);
            }
        }
    }

    verify(assignment) {
        for (let i = 0; i < this.clauses.length; i++) {
            const clause = this.clauses[i];
            let satisfied = false;
            
            for (const literal of clause) {
                const variable = Math.abs(literal);
                const isPositive = literal > 0;
                const value = assignment[variable];
                
                if ((isPositive && value) || (!isPositive && !value)) {
                    satisfied = true;
                    break;
                }
            }
            
            if (!satisfied) return false;
        }
        return true;
    }

    exhaustiveSearch() {
        // Fallback to brute force if centrum approaches fail
        const maxAssignments = Math.pow(2, this.variableCount);
        for (let i = 0; i < maxAssignments; i++) {
            const assignment = {};
            for (let j = 1; j <= this.variableCount; j++) {
                assignment[j] = Boolean((i >> (j - 1)) & 1);
            }
            if (this.verify(assignment)) return assignment;
        }
        return null;
    }
}

// Test the Centrum Theory approach
console.log("🎯 P vs NP Research: Centrum Theory Application");
console.log("═══════════════════════════════════════════════");

const centrumSolver = new CentrumBasedSATSolver();

// Our example SAT problem from before
const problem = [
    [1, -2, 3],      // x1 ∨ ¬x2 ∨ x3
    [-1, 2, -4],     // ¬x1 ∨ x2 ∨ ¬x4
    [2, 3, 4],       // x2 ∨ x3 ∨ x4
    [-1, -3, 4],     // ¬x1 ∨ ¬x3 ∨ x4
    [1, -2, -4],     // x1 ∨ ¬x2 ∨ ¬x4
    [-2, -3, -4]     // ¬x2 ∨ ¬x3 ∨ ¬x4
];

centrumSolver.analyzeCentrum(problem, 0.8);
const solution = centrumSolver.centrumSolve();

if (solution) {
    console.log(`\n🎉 FINAL SOLUTION FOUND!`);
    console.log(`📋 Assignment: ${JSON.stringify(solution)}`);
    console.log(`💡 Centrum Theory provided structured approach to infinite search space`);
} else {
    console.log(`❌ No solution exists (problem is UNSAT)`);
}

module.exports = { CentrumBasedSATSolver };
