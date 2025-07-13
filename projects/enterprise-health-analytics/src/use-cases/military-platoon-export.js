const BiomarkerExporter = require('../biomarker-exporter');
const moment = require('moment');
const chalk = require('chalk');

class MilitaryPlatoonAnalytics extends BiomarkerExporter {
    constructor(config = {}) {
        super(config);
        
        // Military-specific biomarker priorities
        this.militaryCriticalBiomarkers = {
            readiness: [
                'physical_readiness', 'mental_readiness', 'combat_readiness',
                'recovery_status', 'fitness_score', 'endurance_level'
            ],
            performance: [
                'reaction_time', 'cognitive_performance', 'decision_making_speed',
                'situational_awareness', 'focus_score', 'alertness_level'
            ],
            resilience: [
                'stress_resilience', 'mental_toughness', 'adaptation_capacity',
                'emotional_stability', 'pressure_tolerance', 'mental_fatigue'
            ],
            health: [
                'sleep_quality', 'sleep_duration', 'recovery_heart_rate',
                'resting_heart_rate', 'heart_rate_variability', 'vo2_max'
            ],
            lifestyle: [
                'exercise_intensity', 'training_load', 'nutrition_quality',
                'hydration_level', 'body_composition', 'injury_risk'
            ]
        };
        
        // Military fitness standards
        this.militaryStandards = {
            physical_readiness: { min: 0.7, optimal: 0.9 },
            mental_readiness: { min: 0.75, optimal: 0.9 },
            sleep_duration: { min: 360, optimal: 480 }, // 6-8 hours
            recovery_heart_rate: { max: 120 }, // bpm after 1 min rest
            vo2_max: { min: 35, optimal: 50 }, // ml/kg/min
            stress_resilience: { min: 0.6, optimal: 0.8 }
        };
        
        // Mission types affecting biomarker patterns
        this.missionTypes = [
            'Training Exercise', 'Combat Operation', 'Peacekeeping Mission',
            'Humanitarian Aid', 'Base Security', 'Reconnaissance',
            'Special Operations', 'Regular Duty', 'Field Training'
        ];
        
        this.ranks = [
            'Private', 'Private First Class', 'Specialist', 'Corporal',
            'Sergeant', 'Staff Sergeant', 'Sergeant First Class',
            'Master Sergeant', 'First Sergeant', 'Sergeant Major'
        ];
    }

    generateMilitarySampleData(soldierCount = 40, days = 30) {
        console.log(chalk.blue(`🪖 Generating sample data for ${soldierCount} soldiers over ${days} days...`));
        
        const soldiers = Array.from({ length: soldierCount }, (_, i) => ({
            profileId: `soldier-${String(i + 1).padStart(3, '0')}`,
            employeeId: `MIL-${String(i + 1).padStart(4, '0')}`,
            rank: this.ranks[Math.floor(Math.random() * this.ranks.length)],
            mos: this.getRandomMOS(), // Military Occupational Specialty
            unit: this.getRandomUnit(),
            serviceYears: Math.floor(Math.random() * 20) + 1,
            deployments: Math.floor(Math.random() * 5),
            specialization: this.getRandomSpecialization()
        }));

        const sampleData = [];
        
        soldiers.forEach(soldier => {
            for (let day = 0; day < days; day++) {
                const date = moment().subtract(day, 'days');
                const missionType = this.getDailyMission(date, soldier);
                const operationalTempo = this.getOperationalTempo(missionType);
                
                // Generate biomarker data based on mission type and operational tempo
                Object.keys(this.militaryCriticalBiomarkers).forEach(category => {
                    this.militaryCriticalBiomarkers[category].forEach(biomarker => {
                        const value = this.generateMilitaryRealisticValue(
                            biomarker, missionType, operationalTempo, soldier
                        );
                        
                        sampleData.push({
                            profileId: soldier.profileId,
                            employeeId: soldier.employeeId,
                            soldierInfo: {
                                rank: soldier.rank,
                                mos: soldier.mos,
                                unit: soldier.unit,
                                serviceYears: soldier.serviceYears,
                                deployments: soldier.deployments,
                                specialization: soldier.specialization
                            },
                            date: date.format('YYYY-MM-DD'),
                            timestamp: date.toISOString(),
                            category,
                            biomarker,
                            value: value,
                            unit: this.getBiomarkerUnit(biomarker),
                            missionType,
                            operationalTempo,
                            fitnessStandard: this.checkFitnessStandard(biomarker, value),
                            readinessLevel: this.assessReadinessLevel(biomarker, value),
                            deploymentReady: this.checkDeploymentReadiness(biomarker, value),
                            periodicity: 'daily'
                        });
                    });
                });
            }
        });
        
        console.log(chalk.green(`✅ Generated ${sampleData.length} military-specific biomarker records`));
        return sampleData;
    }

    getRandomMOS() {
        const mosList = [
            '11B - Infantry', '13F - Fire Support Specialist', '19D - Cavalry Scout',
            '25B - Information Technology', '68W - Combat Medic', '92G - Food Service',
            '15T - UH-60 Repairer', '35F - Intelligence Analyst', '42A - Human Resources',
            '88M - Motor Transport Operator', '31B - Military Police', '74D - Chemical Operations'
        ];
        return mosList[Math.floor(Math.random() * mosList.length)];
    }

    getRandomUnit() {
        const units = [
            'Alpha Company', 'Bravo Company', 'Charlie Company', 'Delta Company',
            'HHC (Headquarters)', 'Support Company', 'Weapons Company', 'Medical Company'
        ];
        return units[Math.floor(Math.random() * units.length)];
    }

    getRandomSpecialization() {
        const specializations = [
            'Marksmanship', 'Combat Tactics', 'Field Medicine', 'Communications',
            'Demolitions', 'Reconnaissance', 'Logistics', 'Leadership',
            'Technology Systems', 'Physical Training', 'Survival Training'
        ];
        return specializations[Math.floor(Math.random() * specializations.length)];
    }

    getDailyMission(date, soldier) {
        // Simulate mission assignments based on unit and specialization
        const dayOfWeek = date.day();
        
        // Weekends typically have reduced operational tempo
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return Math.random() > 0.7 ? 'Base Security' : 'Regular Duty';
        }
        
        // Mission probability based on soldier's role
        if (soldier.mos.includes('Infantry') || soldier.mos.includes('Cavalry')) {
            const combatMissions = ['Training Exercise', 'Combat Operation', 'Field Training'];
            return combatMissions[Math.floor(Math.random() * combatMissions.length)];
        }
        
        return this.missionTypes[Math.floor(Math.random() * this.missionTypes.length)];
    }

    getOperationalTempo(missionType) {
        const tempoMap = {
            'Combat Operation': 'High',
            'Special Operations': 'High',
            'Field Training': 'High',
            'Training Exercise': 'Medium',
            'Reconnaissance': 'Medium',
            'Peacekeeping Mission': 'Medium',
            'Base Security': 'Low',
            'Regular Duty': 'Low',
            'Humanitarian Aid': 'Low'
        };
        return tempoMap[missionType] || 'Medium';
    }

    generateMilitaryRealisticValue(biomarker, missionType, operationalTempo, soldier) {
        const baseValue = this.generateRealisticValue(biomarker);
        
        // Operational tempo stress factors
        const tempoFactors = {
            'High': { stress: 1.4, fatigue: 1.3, performance: 0.9 },
            'Medium': { stress: 1.1, fatigue: 1.1, performance: 1.0 },
            'Low': { stress: 0.8, fatigue: 0.9, performance: 1.1 }
        };
        
        const tempoFactor = tempoFactors[operationalTempo];
        const experienceFactor = Math.min(1.2, 1.0 + (soldier.serviceYears * 0.01)); // Experience helps
        const deploymentFactor = Math.max(0.9, 1.0 - (soldier.deployments * 0.02)); // Deployment fatigue
        
        switch (biomarker) {
            case 'physical_readiness':
                // Affected by training intensity and mission demands
                const combatMissions = ['Combat Operation', 'Special Operations', 'Field Training'];
                const combatBonus = combatMissions.includes(missionType) ? 1.1 : 1.0;
                return Math.min(1.0, baseValue * combatBonus * experienceFactor);
                
            case 'mental_readiness':
                // High stress missions can impair mental readiness
                return Math.max(0.3, baseValue * (2 - tempoFactor.stress) * experienceFactor);
                
            case 'stress_resilience':
                // Builds over time with experience, but depletes with high tempo
                return Math.min(1.0, baseValue * experienceFactor * (2 - tempoFactor.stress));
                
            case 'sleep_duration':
                // Significantly affected by mission type and operational tempo
                if (missionType === 'Combat Operation' || operationalTempo === 'High') {
                    return Math.max(240, baseValue * 0.7); // 4+ hours minimum
                }
                return Math.max(300, baseValue * 0.9); // Generally reduced sleep
                
            case 'sleep_quality':
                // Poor sleep quality during high-stress operations
                return Math.max(0.4, baseValue * (2 - tempoFactor.stress) * deploymentFactor);
                
            case 'reaction_time':
                // Improves with training, degrades with fatigue
                const reactionBase = 200 + Math.random() * 100; // 200-300ms
                return Math.max(150, reactionBase * tempoFactor.fatigue * (2 - experienceFactor));
                
            case 'cognitive_performance':
                // Affected by stress and fatigue
                return Math.max(0.4, baseValue * tempoFactor.performance * experienceFactor);
                
            case 'heart_rate_variability':
                // Lower HRV indicates higher stress
                return Math.max(20, baseValue * (2 - tempoFactor.stress));
                
            case 'vo2_max':
                // Maintained through training, slight variations
                const fitnessBase = 40 + Math.random() * 20; // 40-60 ml/kg/min
                return Math.max(35, fitnessBase * experienceFactor);
                
            case 'training_load':
                // Higher during combat training and operations
                if (missionType.includes('Training') || missionType === 'Combat Operation') {
                    return Math.min(10, baseValue * 1.5); // Scale 1-10
                }
                return baseValue;
                
            case 'injury_risk':
                // Higher risk during high-intensity operations
                return Math.min(1.0, baseValue * tempoFactor.stress * (2 - experienceFactor));
                
            default:
                return baseValue;
        }
    }

    checkFitnessStandard(biomarker, value) {
        const standard = this.militaryStandards[biomarker];
        if (!standard) return true;
        
        if (standard.min && value < standard.min) return false;
        if (standard.max && value > standard.max) return false;
        
        return true;
    }

    assessReadinessLevel(biomarker, value) {
        // Define readiness levels based on military standards
        const readinessThresholds = {
            physical_readiness: { high: 0.85, medium: 0.7 },
            mental_readiness: { high: 0.8, medium: 0.65 },
            sleep_duration: { high: 420, medium: 360 }, // 7+ hours high, 6+ hours medium
            stress_resilience: { high: 0.75, medium: 0.6 },
            vo2_max: { high: 45, medium: 35 }
        };
        
        const threshold = readinessThresholds[biomarker];
        if (!threshold) return 'medium';
        
        if (biomarker === 'sleep_duration' || biomarker === 'vo2_max') {
            if (value >= threshold.high) return 'high';
            if (value >= threshold.medium) return 'medium';
            return 'low';
        } else {
            if (value >= threshold.high) return 'high';
            if (value >= threshold.medium) return 'medium';
            return 'low';
        }
    }

    checkDeploymentReadiness(biomarker, value) {
        // Critical biomarkers for deployment readiness
        const deploymentCriteria = {
            physical_readiness: 0.75,
            mental_readiness: 0.7,
            sleep_duration: 360, // 6+ hours
            stress_resilience: 0.6,
            vo2_max: 35
        };
        
        const criteria = deploymentCriteria[biomarker];
        if (!criteria) return true;
        
        return value >= criteria;
    }

    exportMilitaryAnalytics(soldierData, unitName = 'MilitaryPlatoon') {
        console.log(chalk.blue('🪖 Creating military platoon health analytics export...'));
        
        const timestamp = moment().format('YYYY-MM-DD_HH-mm');
        const exportDir = `./exports/${unitName}_MilitaryAnalytics_${timestamp}`;
        this.ensureDirectoryExists(exportDir);
        
        // Create specialized military reports
        const reports = [
            this.createReadinessAssessment(soldierData, exportDir, unitName),
            this.createDeploymentReadinessReport(soldierData, exportDir, unitName),
            this.createUnitPerformanceReport(soldierData, exportDir, unitName),
            this.createMissionImpactAnalysis(soldierData, exportDir, unitName),
            this.createFitnessStandardsReport(soldierData, exportDir, unitName)
        ];
        
        // Standard category exports
        const standardExport = this.exportByCategoryToExcel(soldierData, unitName);
        
        console.log(chalk.green(`🎉 Military analytics export complete!`));
        console.log(chalk.cyan(`📁 Export directory: ${exportDir}`));
        console.log(chalk.cyan(`📊 Specialized reports: ${reports.length}`));
        
        return {
            exportDir,
            standardExport,
            specializedReports: reports,
            unitName,
            timestamp
        };
    }

    createReadinessAssessment(soldierData, exportDir, unitName) {
        const fileName = `${unitName}_Readiness_Assessment.xlsx`;
        const workbook = require('xlsx').utils.book_new();
        
        // Individual soldier readiness
        const soldiers = [...new Set(soldierData.map(d => d.profileId))];
        const readinessData = soldiers.map(soldierId => {
            const soldierRecords = soldierData.filter(d => d.profileId === soldierId);
            const soldierInfo = soldierRecords[0].soldierInfo;
            
            const physicalReadiness = this.getAverage(soldierRecords, 'physical_readiness');
            const mentalReadiness = this.getAverage(soldierRecords, 'mental_readiness');
            const overallReadiness = (physicalReadiness + mentalReadiness) / 2;
            
            return {
                employeeId: soldierRecords[0].employeeId,
                profileId: soldierId,
                rank: soldierInfo.rank,
                mos: soldierInfo.mos,
                unit: soldierInfo.unit,
                serviceYears: soldierInfo.serviceYears,
                physicalReadiness: physicalReadiness,
                mentalReadiness: mentalReadiness,
                overallReadiness: Math.round(overallReadiness * 100) / 100,
                readinessLevel: this.getOverallReadinessLevel(overallReadiness),
                deploymentReady: this.checkOverallDeploymentReadiness(soldierRecords),
                recommendedActions: this.getReadinessRecommendations(soldierRecords)
            };
        }).sort((a, b) => b.overallReadiness - a.overallReadiness);
        
        const readinessSheet = require('xlsx').utils.json_to_sheet(readinessData);
        require('xlsx').utils.book_append_sheet(workbook, readinessSheet, 'Individual Readiness');
        
        // Unit readiness summary
        const unitSummary = this.createUnitReadinessSummary(readinessData);
        const summarySheet = require('xlsx').utils.json_to_sheet(unitSummary);
        require('xlsx').utils.book_append_sheet(workbook, summarySheet, 'Unit Summary');
        
        const filePath = `${exportDir}/${fileName}`;
        require('xlsx').writeFile(workbook, filePath);
        
        console.log(chalk.green(`🎯 Created readiness assessment: ${fileName}`));
        return { type: 'Readiness Assessment', fileName, recordCount: readinessData.length };
    }

    createDeploymentReadinessReport(soldierData, exportDir, unitName) {
        const fileName = `${unitName}_Deployment_Readiness.xlsx`;
        const workbook = require('xlsx').utils.book_new();
        
        // Deployment readiness by soldier
        const soldiers = [...new Set(soldierData.map(d => d.profileId))];
        const deploymentData = soldiers.map(soldierId => {
            const soldierRecords = soldierData.filter(d => d.profileId === soldierId);
            const soldierInfo = soldierRecords[0].soldierInfo;
            
            const deploymentReadyChecks = soldierRecords.filter(d => 
                this.militaryStandards[d.biomarker]
            );
            const passedChecks = deploymentReadyChecks.filter(d => d.deploymentReady);
            const readinessRate = deploymentReadyChecks.length > 0 ? 
                (passedChecks.length / deploymentReadyChecks.length) : 0;
            
            return {
                employeeId: soldierRecords[0].employeeId,
                profileId: soldierId,
                rank: soldierInfo.rank,
                mos: soldierInfo.mos,
                deployments: soldierInfo.deployments,
                totalChecks: deploymentReadyChecks.length,
                passedChecks: passedChecks.length,
                readinessRate: Math.round(readinessRate * 100) + '%',
                deploymentStatus: readinessRate >= 0.8 ? 'Ready' : readinessRate >= 0.6 ? 'Conditional' : 'Not Ready',
                criticalDeficiencies: this.getCriticalDeficiencies(soldierRecords),
                timeToReadiness: this.estimateTimeToReadiness(soldierRecords)
            };
        });
        
        const deploymentSheet = require('xlsx').utils.json_to_sheet(deploymentData);
        require('xlsx').utils.book_append_sheet(workbook, deploymentSheet, 'Deployment Status');
        
        const filePath = `${exportDir}/${fileName}`;
        require('xlsx').writeFile(workbook, filePath);
        
        console.log(chalk.yellow(`🚁 Created deployment readiness report: ${fileName}`));
        return { type: 'Deployment Readiness', fileName, recordCount: deploymentData.length };
    }

    createUnitPerformanceReport(soldierData, exportDir, unitName) {
        const fileName = `${unitName}_Unit_Performance_Analysis.xlsx`;
        const workbook = require('xlsx').utils.book_new();
        
        // Performance by MOS
        const mosList = [...new Set(soldierData.map(d => d.soldierInfo.mos))];
        const mosPerformance = mosList.map(mos => {
            const mosData = soldierData.filter(d => d.soldierInfo.mos === mos);
            const soldiers = [...new Set(mosData.map(d => d.profileId))];
            
            return {
                mos,
                soldierCount: soldiers.length,
                avgPhysicalReadiness: this.getAverage(mosData, 'physical_readiness'),
                avgMentalReadiness: this.getAverage(mosData, 'mental_readiness'),
                avgStressResilience: this.getAverage(mosData, 'stress_resilience'),
                avgReactionTime: this.getAverage(mosData, 'reaction_time'),
                avgVO2Max: this.getAverage(mosData, 'vo2_max'),
                highReadinessCount: mosData.filter(d => d.readinessLevel === 'high').length,
                deploymentReadyRate: this.getDeploymentReadyRate(mosData)
            };
        });
        
        const mosSheet = require('xlsx').utils.json_to_sheet(mosPerformance);
        require('xlsx').utils.book_append_sheet(workbook, mosSheet, 'MOS Performance');
        
        // Performance by rank
        const ranks = [...new Set(soldierData.map(d => d.soldierInfo.rank))];
        const rankPerformance = ranks.map(rank => {
            const rankData = soldierData.filter(d => d.soldierInfo.rank === rank);
            const soldiers = [...new Set(rankData.map(d => d.profileId))];
            
            return {
                rank,
                soldierCount: soldiers.length,
                avgLeadershipScore: this.getAverage(rankData, 'leadership_score') || 0,
                avgPhysicalReadiness: this.getAverage(rankData, 'physical_readiness'),
                avgMentalToughness: this.getAverage(rankData, 'mental_toughness'),
                avgDecisionMaking: this.getAverage(rankData, 'decision_making_speed'),
                performanceRating: this.calculateRankPerformance(rankData)
            };
        });
        
        const rankSheet = require('xlsx').utils.json_to_sheet(rankPerformance);
        require('xlsx').utils.book_append_sheet(workbook, rankSheet, 'Rank Performance');
        
        const filePath = `${exportDir}/${fileName}`;
        require('xlsx').writeFile(workbook, filePath);
        
        console.log(chalk.blue(`📊 Created unit performance report: ${fileName}`));
        return { type: 'Unit Performance', fileName, recordCount: mosPerformance.length + rankPerformance.length };
    }

    createMissionImpactAnalysis(soldierData, exportDir, unitName) {
        const fileName = `${unitName}_Mission_Impact_Analysis.xlsx`;
        const workbook = require('xlsx').utils.book_new();
        
        // Performance by mission type
        const missions = [...new Set(soldierData.map(d => d.missionType))];
        const missionAnalysis = missions.map(mission => {
            const missionData = soldierData.filter(d => d.missionType === mission);
            const soldiers = [...new Set(missionData.map(d => d.profileId))];
            
            return {
                missionType: mission,
                frequency: missionData.length,
                participatingSoldiers: soldiers.length,
                avgStressLevel: this.getAverage(missionData, 'stress_level') || 
                              (1 - this.getAverage(missionData, 'stress_resilience')),
                avgFatigueLevel: this.getAverage(missionData, 'mental_fatigue'),
                avgPerformance: this.getAverage(missionData, 'cognitive_performance'),
                avgRecoveryTime: this.getAverage(missionData, 'recovery_time') || 
                               this.estimateRecoveryTime(missionData),
                missionReadiness: this.assessMissionReadiness(missionData),
                recommendedPrep: this.getMissionPreparationRecommendations(mission, missionData)
            };
        });
        
        const missionSheet = require('xlsx').utils.json_to_sheet(missionAnalysis);
        require('xlsx').utils.book_append_sheet(workbook, missionSheet, 'Mission Analysis');
        
        const filePath = `${exportDir}/${fileName}`;
        require('xlsx').writeFile(workbook, filePath);
        
        console.log(chalk.red(`⚔️  Created mission impact analysis: ${fileName}`));
        return { type: 'Mission Impact', fileName, recordCount: missionAnalysis.length };
    }

    createFitnessStandardsReport(soldierData, exportDir, unitName) {
        const fileName = `${unitName}_Fitness_Standards_Compliance.xlsx`;
        const workbook = require('xlsx').utils.book_new();
        
        // Fitness standards compliance
        const soldiers = [...new Set(soldierData.map(d => d.profileId))];
        const fitnessData = soldiers.map(soldierId => {
            const soldierRecords = soldierData.filter(d => d.profileId === soldierId);
            const soldierInfo = soldierRecords[0].soldierInfo;
            
            const fitnessChecks = soldierRecords.filter(d => this.militaryStandards[d.biomarker]);
            const passedStandards = fitnessChecks.filter(d => d.fitnessStandard);
            const complianceRate = fitnessChecks.length > 0 ? 
                (passedStandards.length / fitnessChecks.length) : 0;
            
            return {
                employeeId: soldierRecords[0].employeeId,
                profileId: soldierId,
                rank: soldierInfo.rank,
                mos: soldierInfo.mos,
                vo2Max: this.getAverage(soldierRecords, 'vo2_max'),
                physicalReadiness: this.getAverage(soldierRecords, 'physical_readiness'),
                enduranceLevel: this.getAverage(soldierRecords, 'endurance_level'),
                standardsCompliance: Math.round(complianceRate * 100) + '%',
                fitnessGrade: this.calculateFitnessGrade(soldierRecords),
                improvementAreas: this.getImprovementAreas(soldierRecords),
                trainingRecommendations: this.getTrainingRecommendations(soldierRecords)
            };
        });
        
        const fitnessSheet = require('xlsx').utils.json_to_sheet(fitnessData);
        require('xlsx').utils.book_append_sheet(workbook, fitnessSheet, 'Fitness Compliance');
        
        const filePath = `${exportDir}/${fileName}`;
        require('xlsx').writeFile(workbook, filePath);
        
        console.log(chalk.green(`💪 Created fitness standards report: ${fileName}`));
        return { type: 'Fitness Standards', fileName, recordCount: fitnessData.length };
    }

    // Utility methods specific to military analytics
    getOverallReadinessLevel(readinessScore) {
        if (readinessScore >= 0.85) return 'High';
        if (readinessScore >= 0.7) return 'Medium';
        return 'Low';
    }

    checkOverallDeploymentReadiness(soldierRecords) {
        const criticalBiomarkers = ['physical_readiness', 'mental_readiness', 'sleep_duration'];
        const criticalReadiness = criticalBiomarkers.every(biomarker => {
            const records = soldierRecords.filter(r => r.biomarker === biomarker);
            return records.some(r => r.deploymentReady);
        });
        
        return criticalReadiness ? 'Ready' : 'Not Ready';
    }

    getReadinessRecommendations(soldierRecords) {
        const recommendations = [];
        
        const avgPhysical = this.getAverage(soldierRecords, 'physical_readiness');
        const avgMental = this.getAverage(soldierRecords, 'mental_readiness');
        const avgSleep = this.getAverage(soldierRecords, 'sleep_duration');
        
        if (avgPhysical < 0.7) recommendations.push('Increase physical training intensity');
        if (avgMental < 0.7) recommendations.push('Mental resilience training required');
        if (avgSleep < 360) recommendations.push('Sleep hygiene intervention needed');
        
        return recommendations.join('; ') || 'Maintain current training regimen';
    }

    createUnitReadinessSummary(readinessData) {
        const totalSoldiers = readinessData.length;
        const highReadiness = readinessData.filter(s => s.readinessLevel === 'High').length;
        const mediumReadiness = readinessData.filter(s => s.readinessLevel === 'Medium').length;
        const lowReadiness = readinessData.filter(s => s.readinessLevel === 'Low').length;
        const deploymentReady = readinessData.filter(s => s.deploymentReady === 'Ready').length;
        
        return [
            { metric: 'Total Soldiers', value: totalSoldiers },
            { metric: 'High Readiness', value: `${highReadiness} (${Math.round(highReadiness/totalSoldiers*100)}%)` },
            { metric: 'Medium Readiness', value: `${mediumReadiness} (${Math.round(mediumReadiness/totalSoldiers*100)}%)` },
            { metric: 'Low Readiness', value: `${lowReadiness} (${Math.round(lowReadiness/totalSoldiers*100)}%)` },
            { metric: 'Deployment Ready', value: `${deploymentReady} (${Math.round(deploymentReady/totalSoldiers*100)}%)` },
            { metric: 'Unit Readiness Level', value: highReadiness/totalSoldiers >= 0.7 ? 'High' : mediumReadiness/totalSoldiers >= 0.6 ? 'Medium' : 'Low' }
        ];
    }

    // Utility methods for calculations
    getAverage(records, biomarker) {
        const values = records.filter(r => r.biomarker === biomarker).map(r => parseFloat(r.value));
        return values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100 : 0;
    }

    getCriticalDeficiencies(soldierRecords) {
        const deficiencies = [];
        
        Object.keys(this.militaryStandards).forEach(biomarker => {
            const records = soldierRecords.filter(r => r.biomarker === biomarker);
            const failedStandards = records.filter(r => !r.fitnessStandard);
            
            if (failedStandards.length > records.length * 0.3) { // >30% failure rate
                deficiencies.push(biomarker);
            }
        });
        
        return deficiencies.join(', ') || 'None identified';
    }

    estimateTimeToReadiness(soldierRecords) {
        const deficiencies = this.getCriticalDeficiencies(soldierRecords);
        if (deficiencies === 'None identified') return 'Ready now';
        
        // Estimate based on typical improvement timelines
        const timeEstimates = {
            physical_readiness: '4-6 weeks',
            mental_readiness: '2-4 weeks',
            sleep_duration: '1-2 weeks',
            vo2_max: '6-8 weeks',
            stress_resilience: '3-4 weeks'
        };
        
        const maxTime = deficiencies.split(', ').map(def => timeEstimates[def] || '2-3 weeks');
        return maxTime[0] || '2-4 weeks';
    }

    getDeploymentReadyRate(data) {
        const soldiers = [...new Set(data.map(d => d.profileId))];
        const readySoldiers = soldiers.filter(soldierId => {
            const soldierData = data.filter(d => d.profileId === soldierId);
            return this.checkOverallDeploymentReadiness(soldierData) === 'Ready';
        });
        
        return Math.round((readySoldiers.length / soldiers.length) * 100) + '%';
    }

    calculateRankPerformance(rankData) {
        const physicalScore = this.getAverage(rankData, 'physical_readiness') * 100;
        const mentalScore = this.getAverage(rankData, 'mental_readiness') * 100;
        const resilience = this.getAverage(rankData, 'stress_resilience') * 100;
        
        const overallScore = (physicalScore + mentalScore + resilience) / 3;
        
        if (overallScore >= 85) return 'Excellent';
        if (overallScore >= 75) return 'Good';
        if (overallScore >= 65) return 'Satisfactory';
        return 'Needs Improvement';
    }

    estimateRecoveryTime(missionData) {
        // Estimate recovery time based on mission intensity
        const stressLevel = this.getAverage(missionData, 'stress_level') || 0.5;
        const fatigueLevel = this.getAverage(missionData, 'mental_fatigue') || 0.5;
        
        const recoveryHours = Math.round((stressLevel + fatigueLevel) * 12); // 0-24 hours
        return Math.max(4, Math.min(24, recoveryHours)); // 4-24 hour range
    }

    assessMissionReadiness(missionData) {
        const readinessMetrics = [
            this.getAverage(missionData, 'physical_readiness'),
            this.getAverage(missionData, 'mental_readiness'),
            this.getAverage(missionData, 'stress_resilience')
        ].filter(m => m > 0);
        
        const avgReadiness = readinessMetrics.reduce((a, b) => a + b, 0) / readinessMetrics.length;
        
        if (avgReadiness >= 0.8) return 'High';
        if (avgReadiness >= 0.65) return 'Medium';
        return 'Low';
    }

    getMissionPreparationRecommendations(mission, missionData) {
        const recommendations = [];
        const missionStress = this.getAverage(missionData, 'stress_level') || 0.5;
        
        if (mission.includes('Combat') && missionStress > 0.7) {
            recommendations.push('Pre-deployment stress inoculation training');
        }
        if (mission.includes('Special Operations')) {
            recommendations.push('Enhanced physical conditioning, mental preparation protocols');
        }
        if (mission.includes('Training')) {
            recommendations.push('Progressive training load, recovery monitoring');
        }
        
        return recommendations.join('; ') || 'Standard preparation protocols';
    }

    calculateFitnessGrade(soldierRecords) {
        const vo2 = this.getAverage(soldierRecords, 'vo2_max');
        const physical = this.getAverage(soldierRecords, 'physical_readiness') * 100;
        const endurance = this.getAverage(soldierRecords, 'endurance_level') * 100;
        
        const fitnessScore = (vo2 + physical + endurance) / 3;
        
        if (fitnessScore >= 85) return 'A';
        if (fitnessScore >= 75) return 'B';
        if (fitnessScore >= 65) return 'C';
        if (fitnessScore >= 55) return 'D';
        return 'F';
    }

    getImprovementAreas(soldierRecords) {
        const areas = [];
        
        if (this.getAverage(soldierRecords, 'vo2_max') < 40) areas.push('Cardiovascular endurance');
        if (this.getAverage(soldierRecords, 'physical_readiness') < 0.75) areas.push('Physical strength');
        if (this.getAverage(soldierRecords, 'mental_readiness') < 0.75) areas.push('Mental toughness');
        
        return areas.join(', ') || 'Maintain current fitness level';
    }

    getTrainingRecommendations(soldierRecords) {
        const recommendations = [];
        
        const vo2 = this.getAverage(soldierRecords, 'vo2_max');
        const physical = this.getAverage(soldierRecords, 'physical_readiness');
        
        if (vo2 < 40) recommendations.push('Increase cardio training frequency');
        if (physical < 0.75) recommendations.push('Focus on strength and functional fitness');
        
        return recommendations.join('; ') || 'Continue current training program';
    }
}

// CLI interface for military platoon export
if (require.main === module) {
    const { program } = require('commander');
    
    program
        .version('1.0.0')
        .description('Military Platoon Health Analytics Exporter');
    
    program
        .command('demo')
        .description('Generate military platoon demo data and analytics')
        .option('-s, --soldiers <number>', 'Number of soldiers', '40')
        .option('-d, --days <number>', 'Number of days of data', '30')
        .option('-u, --unit <name>', 'Unit name', 'DemoMilitaryPlatoon')
        .action((options) => {
            console.log(chalk.blue('🪖 Generating military platoon health analytics...'));
            
            const analytics = new MilitaryPlatoonAnalytics();
            const soldierData = analytics.generateMilitarySampleData(
                parseInt(options.soldiers), 
                parseInt(options.days)
            );
            
            const result = analytics.exportMilitaryAnalytics(soldierData, options.unit);
            
            console.log(chalk.green(`\n🎉 Military analytics complete!`));
            console.log(chalk.cyan(`📁 Export directory: ${result.exportDir}`));
            console.log(chalk.cyan(`📊 Total records: ${soldierData.length}`));
            console.log(chalk.cyan(`📋 Specialized reports: ${result.specializedReports.length}`));
        });
    
    program.parse();
}

module.exports = MilitaryPlatoonAnalytics;