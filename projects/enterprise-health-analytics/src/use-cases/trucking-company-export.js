const BiomarkerExporter = require('../biomarker-exporter');
const moment = require('moment');
const chalk = require('chalk');

class TruckingCompanyAnalytics extends BiomarkerExporter {
    constructor(config = {}) {
        super(config);
        
        // Trucking-specific biomarker priorities
        this.truckingCriticalBiomarkers = {
            safety: [
                'sleep_duration', 'sleep_quality', 'sleep_debt', 'sleep_efficiency',
                'fatigue_score', 'alertness_level', 'reaction_time'
            ],
            performance: [
                'stress_level', 'energy_level', 'focus_score', 'cognitive_load',
                'mental_fatigue', 'decision_making_capacity'
            ],
            health: [
                'heart_rate_average', 'resting_heart_rate', 'blood_pressure_systolic',
                'body_temperature', 'hydration_level'
            ],
            lifestyle: [
                'steps', 'active_duration', 'sedentary_time', 'exercise_duration',
                'meal_timing', 'caffeine_intake'
            ]
        };
        
        // DOT compliance thresholds
        this.dotThresholds = {
            sleep_duration: { min: 480, optimal: 540 }, // 8-9 hours
            sleep_debt: { max: 2 }, // Max 2 hours deficit
            fatigue_score: { max: 0.7 }, // Max 70% fatigue
            stress_level: { max: 0.8 }, // Max 80% stress
            heart_rate_max: { max: 180 } // Max heart rate threshold
        };
    }

    generateTruckingSampleData(driverCount = 50, days = 30) {
        console.log(chalk.blue(`🚛 Generating sample data for ${driverCount} drivers over ${days} days...`));
        
        const drivers = Array.from({ length: driverCount }, (_, i) => ({
            profileId: `driver-${String(i + 1).padStart(3, '0')}`,
            employeeId: `DRV-${String(i + 1).padStart(4, '0')}`,
            cdlClass: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
            route: this.getRandomRoute(),
            shift: this.getRandomShift(),
            experience: Math.floor(Math.random() * 20) + 1 // 1-20 years
        }));

        const sampleData = [];
        
        drivers.forEach(driver => {
            for (let day = 0; day < days; day++) {
                const date = moment().subtract(day, 'days');
                const isWorkDay = this.isWorkDay(date, driver.shift);
                
                // Generate biomarker data based on work schedule
                Object.keys(this.truckingCriticalBiomarkers).forEach(category => {
                    this.truckingCriticalBiomarkers[category].forEach(biomarker => {
                        const value = this.generateTruckingRealisticValue(biomarker, isWorkDay, driver);
                        
                        sampleData.push({
                            profileId: driver.profileId,
                            employeeId: driver.employeeId,
                            driverInfo: {
                                cdlClass: driver.cdlClass,
                                route: driver.route,
                                shift: driver.shift,
                                experience: driver.experience
                            },
                            date: date.format('YYYY-MM-DD'),
                            timestamp: date.toISOString(),
                            category,
                            biomarker,
                            value: value,
                            unit: this.getBiomarkerUnit(biomarker),
                            isWorkDay,
                            dotCompliant: this.checkDOTCompliance(biomarker, value),
                            riskLevel: this.assessRiskLevel(biomarker, value),
                            periodicity: 'daily'
                        });
                    });
                });
            }
        });
        
        console.log(chalk.green(`✅ Generated ${sampleData.length} trucking-specific biomarker records`));
        return sampleData;
    }

    getRandomRoute() {
        const routes = [
            'Interstate Long-Haul', 'Regional Delivery', 'Local Distribution',
            'Cross-Country Freight', 'Urban Delivery', 'Construction Haul'
        ];
        return routes[Math.floor(Math.random() * routes.length)];
    }

    getRandomShift() {
        const shifts = [
            'Day Shift (6AM-6PM)', 'Night Shift (6PM-6AM)', 'Split Shift',
            'Flexible Hours', 'Early Morning (4AM-2PM)', 'Evening (2PM-12AM)'
        ];
        return shifts[Math.floor(Math.random() * shifts.length)];
    }

    isWorkDay(date, shift) {
        // Most truckers work 5-6 days per week
        const dayOfWeek = date.day();
        if (shift.includes('Long-Haul') || shift.includes('Cross-Country')) {
            return dayOfWeek !== 0; // Sunday off for long-haul
        }
        return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday-Friday for local
    }

    generateTruckingRealisticValue(biomarker, isWorkDay, driver) {
        // Adjust values based on work day stress and route type
        const workStressFactor = isWorkDay ? 1.2 : 0.8;
        const routeStressFactor = driver.route.includes('Long-Haul') ? 1.3 : 1.0;
        const experienceFactor = Math.max(0.7, 1.2 - (driver.experience * 0.02)); // More experience = less stress
        
        const baseValue = this.generateRealisticValue(biomarker);
        
        // Apply trucking-specific modifications
        switch (biomarker) {
            case 'sleep_duration':
                // Truckers often have irregular sleep
                return isWorkDay ? 
                    Math.max(300, baseValue - Math.random() * 120) : // Work days: possibly less sleep
                    Math.min(600, baseValue + Math.random() * 60);   // Rest days: catch up sleep
                    
            case 'sleep_quality':
                // Quality affected by stress and environment
                return Math.max(0.3, baseValue * (2 - workStressFactor) * (2 - routeStressFactor));
                
            case 'stress_level':
                // Higher stress on work days, especially long-haul
                return Math.min(1.0, baseValue * workStressFactor * routeStressFactor * experienceFactor);
                
            case 'fatigue_score':
                // Fatigue correlates with work intensity
                return isWorkDay ? 
                    Math.min(1.0, baseValue * workStressFactor * routeStressFactor) :
                    Math.max(0.2, baseValue * 0.6);
                    
            case 'heart_rate_average':
                // Elevated during work, especially in stressful conditions
                return isWorkDay ?
                    Math.min(120, baseValue * workStressFactor) :
                    baseValue;
                    
            case 'steps':
                // Truckers typically have low step counts on work days
                return isWorkDay ?
                    Math.max(1000, baseValue * 0.3) : // Low steps when driving
                    baseValue; // Normal activity on off days
                    
            case 'active_duration':
                // Limited activity during long drives
                return isWorkDay && driver.route.includes('Long-Haul') ?
                    Math.max(15, baseValue * 0.2) : // Very limited activity
                    baseValue;
                    
            case 'sedentary_time':
                // High sedentary time for truckers
                return isWorkDay ?
                    Math.max(600, baseValue * 2) : // 10+ hours sedentary
                    baseValue;
                    
            default:
                return baseValue;
        }
    }

    checkDOTCompliance(biomarker, value) {
        const threshold = this.dotThresholds[biomarker];
        if (!threshold) return true;
        
        if (threshold.min && value < threshold.min) return false;
        if (threshold.max && value > threshold.max) return false;
        if (threshold.optimal && Math.abs(value - threshold.optimal) > threshold.optimal * 0.3) return false;
        
        return true;
    }

    assessRiskLevel(biomarker, value) {
        // Define risk levels based on biomarker values
        const riskThresholds = {
            sleep_duration: { high: 360, medium: 420 }, // < 6 hours high risk, < 7 hours medium
            sleep_debt: { high: 3, medium: 1.5 },
            fatigue_score: { high: 0.8, medium: 0.6 },
            stress_level: { high: 0.8, medium: 0.6 },
            heart_rate_average: { high: 100, medium: 85 }
        };
        
        const threshold = riskThresholds[biomarker];
        if (!threshold) return 'low';
        
        if (biomarker === 'sleep_duration') {
            if (value < threshold.high) return 'high';
            if (value < threshold.medium) return 'medium';
            return 'low';
        } else {
            if (value > threshold.high) return 'high';
            if (value > threshold.medium) return 'medium';
            return 'low';
        }
    }

    exportTruckingAnalytics(driverData, companyName = 'TruckingCompany') {
        console.log(chalk.blue('🚛 Creating trucking company health analytics export...'));
        
        const timestamp = moment().format('YYYY-MM-DD_HH-mm');
        const exportDir = `./exports/${companyName}_TruckingAnalytics_${timestamp}`;
        this.ensureDirectoryExists(exportDir);
        
        // Create specialized trucking reports
        const reports = [
            this.createDOTComplianceReport(driverData, exportDir, companyName),
            this.createSafetyRiskReport(driverData, exportDir, companyName),
            this.createDriverPerformanceReport(driverData, exportDir, companyName),
            this.createRouteAnalysisReport(driverData, exportDir, companyName)
        ];
        
        // Standard category exports
        const standardExport = this.exportByCategoryToExcel(driverData, companyName);
        
        console.log(chalk.green(`🎉 Trucking analytics export complete!`));
        console.log(chalk.cyan(`📁 Export directory: ${exportDir}`));
        console.log(chalk.cyan(`📊 Specialized reports: ${reports.length}`));
        
        return {
            exportDir,
            standardExport,
            specializedReports: reports,
            companyName,
            timestamp
        };
    }

    createDOTComplianceReport(driverData, exportDir, companyName) {
        const fileName = `${companyName}_DOT_Compliance_Report.xlsx`;
        const workbook = require('xlsx').utils.book_new();
        
        // Compliance summary by driver
        const drivers = [...new Set(driverData.map(d => d.profileId))];
        const complianceData = drivers.map(driverId => {
            const driverRecords = driverData.filter(d => d.profileId === driverId);
            const driverInfo = driverRecords[0].driverInfo;
            
            const complianceChecks = driverRecords.filter(d => this.dotThresholds[d.biomarker]);
            const compliantRecords = complianceChecks.filter(d => d.dotCompliant);
            const complianceRate = complianceChecks.length > 0 ? 
                (compliantRecords.length / complianceChecks.length * 100).toFixed(2) : 'N/A';
            
            return {
                employeeId: driverRecords[0].employeeId,
                profileId: driverId,
                cdlClass: driverInfo.cdlClass,
                route: driverInfo.route,
                experience: driverInfo.experience,
                totalChecks: complianceChecks.length,
                compliantRecords: compliantRecords.length,
                complianceRate: complianceRate + '%',
                riskLevel: this.getOverallRiskLevel(driverRecords)
            };
        });
        
        const complianceSheet = require('xlsx').utils.json_to_sheet(complianceData);
        require('xlsx').utils.book_append_sheet(workbook, complianceSheet, 'DOT Compliance');
        
        // Non-compliant incidents
        const incidents = driverData.filter(d => !d.dotCompliant);
        const incidentSheet = require('xlsx').utils.json_to_sheet(incidents);
        require('xlsx').utils.book_append_sheet(workbook, incidentSheet, 'Non-Compliant Incidents');
        
        const filePath = `${exportDir}/${fileName}`;
        require('xlsx').writeFile(workbook, filePath);
        
        console.log(chalk.yellow(`📋 Created DOT compliance report: ${fileName}`));
        return { type: 'DOT Compliance', fileName, recordCount: complianceData.length };
    }

    createSafetyRiskReport(driverData, exportDir, companyName) {
        const fileName = `${companyName}_Safety_Risk_Assessment.xlsx`;
        const workbook = require('xlsx').utils.book_new();
        
        // High-risk drivers
        const drivers = [...new Set(driverData.map(d => d.profileId))];
        const riskAssessment = drivers.map(driverId => {
            const driverRecords = driverData.filter(d => d.profileId === driverId);
            const highRiskRecords = driverRecords.filter(d => d.riskLevel === 'high');
            const mediumRiskRecords = driverRecords.filter(d => d.riskLevel === 'medium');
            
            return {
                employeeId: driverRecords[0].employeeId,
                profileId: driverId,
                totalRecords: driverRecords.length,
                highRiskCount: highRiskRecords.length,
                mediumRiskCount: mediumRiskRecords.length,
                riskScore: this.calculateRiskScore(driverRecords),
                primaryRiskFactors: this.getPrimaryRiskFactors(driverRecords),
                recommendedActions: this.getRecommendedActions(driverRecords)
            };
        }).sort((a, b) => b.riskScore - a.riskScore); // Sort by highest risk first
        
        const riskSheet = require('xlsx').utils.json_to_sheet(riskAssessment);
        require('xlsx').utils.book_append_sheet(workbook, riskSheet, 'Risk Assessment');
        
        const filePath = `${exportDir}/${fileName}`;
        require('xlsx').writeFile(workbook, filePath);
        
        console.log(chalk.red(`⚠️  Created safety risk report: ${fileName}`));
        return { type: 'Safety Risk', fileName, recordCount: riskAssessment.length };
    }

    createDriverPerformanceReport(driverData, exportDir, companyName) {
        const fileName = `${companyName}_Driver_Performance_Metrics.xlsx`;
        const workbook = require('xlsx').utils.book_new();
        
        // Performance metrics by driver
        const drivers = [...new Set(driverData.map(d => d.profileId))];
        const performanceData = drivers.map(driverId => {
            const driverRecords = driverData.filter(d => d.profileId === driverId);
            const driverInfo = driverRecords[0].driverInfo;
            
            return {
                employeeId: driverRecords[0].employeeId,
                profileId: driverId,
                cdlClass: driverInfo.cdlClass,
                route: driverInfo.route,
                experience: driverInfo.experience,
                avgSleepDuration: this.getAverage(driverRecords, 'sleep_duration'),
                avgSleepQuality: this.getAverage(driverRecords, 'sleep_quality'),
                avgStressLevel: this.getAverage(driverRecords, 'stress_level'),
                avgFatigueScore: this.getAverage(driverRecords, 'fatigue_score'),
                avgHeartRate: this.getAverage(driverRecords, 'heart_rate_average'),
                performanceScore: this.calculatePerformanceScore(driverRecords)
            };
        });
        
        const performanceSheet = require('xlsx').utils.json_to_sheet(performanceData);
        require('xlsx').utils.book_append_sheet(workbook, performanceSheet, 'Driver Performance');
        
        const filePath = `${exportDir}/${fileName}`;
        require('xlsx').writeFile(workbook, filePath);
        
        console.log(chalk.green(`📈 Created driver performance report: ${fileName}`));
        return { type: 'Driver Performance', fileName, recordCount: performanceData.length };
    }

    createRouteAnalysisReport(driverData, exportDir, companyName) {
        const fileName = `${companyName}_Route_Health_Analysis.xlsx`;
        const workbook = require('xlsx').utils.book_new();
        
        // Group by route type
        const routes = [...new Set(driverData.map(d => d.driverInfo.route))];
        const routeAnalysis = routes.map(route => {
            const routeData = driverData.filter(d => d.driverInfo.route === route);
            const drivers = [...new Set(routeData.map(d => d.profileId))];
            
            return {
                route,
                driverCount: drivers.length,
                avgSleepDuration: this.getAverage(routeData, 'sleep_duration'),
                avgStressLevel: this.getAverage(routeData, 'stress_level'),
                avgFatigueScore: this.getAverage(routeData, 'fatigue_score'),
                highRiskIncidents: routeData.filter(d => d.riskLevel === 'high').length,
                complianceRate: this.getComplianceRate(routeData),
                recommendedImprovements: this.getRouteRecommendations(route, routeData)
            };
        });
        
        const routeSheet = require('xlsx').utils.json_to_sheet(routeAnalysis);
        require('xlsx').utils.book_append_sheet(workbook, routeSheet, 'Route Analysis');
        
        const filePath = `${exportDir}/${fileName}`;
        require('xlsx').writeFile(workbook, filePath);
        
        console.log(chalk.blue(`🛣️  Created route analysis report: ${fileName}`));
        return { type: 'Route Analysis', fileName, recordCount: routeAnalysis.length };
    }

    // Utility methods
    getAverage(records, biomarker) {
        const values = records.filter(r => r.biomarker === biomarker).map(r => parseFloat(r.value));
        return values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100 : 0;
    }

    calculateRiskScore(driverRecords) {
        const highRisk = driverRecords.filter(d => d.riskLevel === 'high').length;
        const mediumRisk = driverRecords.filter(d => d.riskLevel === 'medium').length;
        const total = driverRecords.length;
        
        return Math.round(((highRisk * 3 + mediumRisk * 1) / total) * 100) / 100;
    }

    getOverallRiskLevel(driverRecords) {
        const riskScore = this.calculateRiskScore(driverRecords);
        if (riskScore > 2) return 'high';
        if (riskScore > 1) return 'medium';
        return 'low';
    }

    getPrimaryRiskFactors(driverRecords) {
        const riskFactors = {};
        driverRecords.filter(d => d.riskLevel === 'high').forEach(d => {
            riskFactors[d.biomarker] = (riskFactors[d.biomarker] || 0) + 1;
        });
        
        return Object.entries(riskFactors)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([factor, count]) => `${factor} (${count})`)
            .join(', ');
    }

    getRecommendedActions(driverRecords) {
        const actions = [];
        const avgSleep = this.getAverage(driverRecords, 'sleep_duration');
        const avgStress = this.getAverage(driverRecords, 'stress_level');
        const avgFatigue = this.getAverage(driverRecords, 'fatigue_score');
        
        if (avgSleep < 420) actions.push('Sleep hygiene training');
        if (avgStress > 0.7) actions.push('Stress management program');
        if (avgFatigue > 0.7) actions.push('Fatigue management protocols');
        
        return actions.join('; ') || 'Continue current practices';
    }

    getComplianceRate(routeData) {
        const complianceChecks = routeData.filter(d => this.dotThresholds[d.biomarker]);
        const compliant = complianceChecks.filter(d => d.dotCompliant);
        return complianceChecks.length > 0 ? 
            Math.round((compliant.length / complianceChecks.length) * 100) + '%' : 'N/A';
    }

    getRouteRecommendations(route, routeData) {
        const recommendations = [];
        const avgStress = this.getAverage(routeData, 'stress_level');
        const avgFatigue = this.getAverage(routeData, 'fatigue_score');
        
        if (route.includes('Long-Haul') && avgFatigue > 0.7) {
            recommendations.push('Implement mandatory rest stops');
        }
        if (avgStress > 0.8) {
            recommendations.push('Route optimization to reduce stress factors');
        }
        if (route.includes('Urban') && avgStress > 0.7) {
            recommendations.push('Traffic pattern analysis and alternative routing');
        }
        
        return recommendations.join('; ') || 'No specific recommendations';
    }

    calculatePerformanceScore(driverRecords) {
        const sleepScore = Math.max(0, 1 - (this.getAverage(driverRecords, 'sleep_debt') / 4));
        const stressScore = Math.max(0, 1 - this.getAverage(driverRecords, 'stress_level'));
        const fatigueScore = Math.max(0, 1 - this.getAverage(driverRecords, 'fatigue_score'));
        
        return Math.round(((sleepScore + stressScore + fatigueScore) / 3) * 100);
    }
}

// CLI interface for trucking company export
if (require.main === module) {
    const { program } = require('commander');
    
    program
        .version('1.0.0')
        .description('Trucking Company Health Analytics Exporter');
    
    program
        .command('demo')
        .description('Generate trucking company demo data and analytics')
        .option('-d, --drivers <number>', 'Number of drivers', '50')
        .option('-t, --days <number>', 'Number of days of data', '30')
        .option('-c, --company <name>', 'Company name', 'DemoTruckingCorp')
        .action((options) => {
            console.log(chalk.blue('🚛 Generating trucking company health analytics...'));
            
            const analytics = new TruckingCompanyAnalytics();
            const driverData = analytics.generateTruckingSampleData(
                parseInt(options.drivers), 
                parseInt(options.days)
            );
            
            const result = analytics.exportTruckingAnalytics(driverData, options.company);
            
            console.log(chalk.green(`\n🎉 Trucking analytics complete!`));
            console.log(chalk.cyan(`📁 Export directory: ${result.exportDir}`));
            console.log(chalk.cyan(`📊 Total records: ${driverData.length}`));
            console.log(chalk.cyan(`📋 Specialized reports: ${result.specializedReports.length}`));
        });
    
    program.parse();
}

module.exports = TruckingCompanyAnalytics;