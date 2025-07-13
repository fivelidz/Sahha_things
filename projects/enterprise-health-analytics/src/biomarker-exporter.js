const XLSX = require('xlsx');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class BiomarkerExporter {
    constructor(config = {}) {
        this.config = {
            apiUrl: process.env.SAHHA_API_URL || 'https://sandbox-api.sahha.ai',
            authToken: process.env.SAHHA_AUTH_TOKEN,
            outputDir: config.outputDir || './exports',
            dateFormat: config.dateFormat || 'YYYY-MM-DD',
            ...config
        };
        
        this.biomarkerCategories = {
            sleep: [
                'sleep_duration', 'sleep_quality', 'sleep_efficiency', 'sleep_regularity',
                'sleep_debt', 'sleep_start_time', 'sleep_end_time', 'sleep_mid_time',
                'sleep_in_bed_duration', 'deep_sleep_duration', 'rem_sleep_duration',
                'light_sleep_duration', 'sleep_interruptions', 'sleep_onset_latency'
            ],
            activity: [
                'steps', 'distance', 'calories_burned', 'active_duration', 'sedentary_time',
                'exercise_duration', 'walking_duration', 'running_duration',
                'cycling_duration', 'swimming_duration', 'workout_intensity',
                'movement_efficiency', 'activity_balance', 'recovery_time'
            ],
            heart: [
                'heart_rate_average', 'heart_rate_max', 'heart_rate_min', 
                'resting_heart_rate', 'heart_rate_variability', 'heart_rate_zones',
                'cardiovascular_strain', 'recovery_heart_rate'
            ],
            mental: [
                'stress_level', 'mood_score', 'energy_level', 'focus_score',
                'mental_fatigue', 'cognitive_load', 'emotional_balance'
            ],
            body: [
                'body_temperature', 'weight', 'body_fat_percentage', 'muscle_mass',
                'hydration_level', 'blood_pressure_systolic', 'blood_pressure_diastolic'
            ],
            environment: [
                'ambient_temperature', 'humidity', 'air_quality', 'noise_level',
                'light_exposure', 'uv_exposure'
            ]
        };
    }

    // Create directory if it doesn't exist
    ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    // Generate sample data for demonstration
    generateSampleData(profileIds, days = 30) {
        const sampleData = [];
        const categories = Object.keys(this.biomarkerCategories);
        
        profileIds.forEach(profileId => {
            for (let day = 0; day < days; day++) {
                const date = moment().subtract(day, 'days');
                
                categories.forEach(category => {
                    this.biomarkerCategories[category].forEach(biomarker => {
                        sampleData.push({
                            profileId,
                            employeeId: `EMP-${profileId.slice(-4)}`,
                            date: date.format('YYYY-MM-DD'),
                            timestamp: date.toISOString(),
                            category,
                            biomarker,
                            value: this.generateRealisticValue(biomarker),
                            unit: this.getBiomarkerUnit(biomarker),
                            periodicity: 'daily'
                        });
                    });
                });
            }
        });
        
        return sampleData;
    }

    generateRealisticValue(biomarker) {
        const valueRanges = {
            // Sleep biomarkers (minutes/hours/percentages)
            'sleep_duration': () => Math.floor(Math.random() * 240) + 360, // 6-10 hours in minutes
            'sleep_quality': () => Math.round((Math.random() * 0.4 + 0.6) * 100) / 100, // 0.6-1.0
            'sleep_efficiency': () => Math.round((Math.random() * 0.3 + 0.7) * 100) / 100, // 0.7-1.0
            'sleep_debt': () => Math.round((Math.random() * 2) * 100) / 100, // 0-2 hours
            
            // Activity biomarkers
            'steps': () => Math.floor(Math.random() * 15000) + 2000, // 2,000-17,000 steps
            'calories_burned': () => Math.floor(Math.random() * 1500) + 1800, // 1800-3300 calories
            'active_duration': () => Math.floor(Math.random() * 120) + 30, // 30-150 minutes
            'distance': () => Math.round((Math.random() * 15 + 2) * 100) / 100, // 2-17 km
            
            // Heart biomarkers
            'heart_rate_average': () => Math.floor(Math.random() * 40) + 60, // 60-100 bpm
            'resting_heart_rate': () => Math.floor(Math.random() * 20) + 50, // 50-70 bpm
            'heart_rate_variability': () => Math.floor(Math.random() * 50) + 20, // 20-70 ms
            
            // Mental biomarkers
            'stress_level': () => Math.round((Math.random() * 0.6 + 0.2) * 100) / 100, // 0.2-0.8
            'mood_score': () => Math.round((Math.random() * 0.6 + 0.4) * 100) / 100, // 0.4-1.0
            'energy_level': () => Math.round((Math.random() * 0.6 + 0.4) * 100) / 100, // 0.4-1.0
            
            // Body biomarkers
            'body_temperature': () => Math.round((Math.random() * 2 + 36.1) * 100) / 100, // 36.1-38.1°C
            'weight': () => Math.round((Math.random() * 50 + 60) * 10) / 10, // 60-110 kg
            
            // Environment biomarkers
            'ambient_temperature': () => Math.round((Math.random() * 25 + 15) * 10) / 10, // 15-40°C
            'humidity': () => Math.round(Math.random() * 60 + 30), // 30-90%
        };
        
        return valueRanges[biomarker] ? valueRanges[biomarker]() : Math.round(Math.random() * 100);
    }

    getBiomarkerUnit(biomarker) {
        const units = {
            'sleep_duration': 'minutes',
            'sleep_quality': 'percentage',
            'sleep_efficiency': 'percentage',
            'sleep_debt': 'hours',
            'steps': 'count',
            'calories_burned': 'kcal',
            'active_duration': 'minutes',
            'distance': 'km',
            'heart_rate_average': 'bpm',
            'resting_heart_rate': 'bpm',
            'heart_rate_variability': 'ms',
            'stress_level': 'percentage',
            'mood_score': 'percentage',
            'energy_level': 'percentage',
            'body_temperature': 'celsius',
            'weight': 'kg',
            'ambient_temperature': 'celsius',
            'humidity': 'percentage'
        };
        
        return units[biomarker] || 'unit';
    }

    // Export data to category-specific Excel files
    exportByCategoryToExcel(data, organizationName = 'Organization') {
        const timestamp = moment().format('YYYY-MM-DD_HH-mm');
        const exportDir = path.join(this.config.outputDir, `${organizationName}_${timestamp}`);
        this.ensureDirectoryExists(exportDir);
        
        const exportedFiles = [];
        
        // Group data by category
        const categorizedData = {};
        data.forEach(record => {
            if (!categorizedData[record.category]) {
                categorizedData[record.category] = [];
            }
            categorizedData[record.category].push(record);
        });

        // Create Excel file for each category
        Object.keys(categorizedData).forEach(category => {
            const categoryData = categorizedData[category];
            const fileName = `${organizationName}_${category}_biomarkers_${timestamp}.xlsx`;
            const filePath = path.join(exportDir, fileName);
            
            // Create workbook with multiple sheets
            const workbook = XLSX.utils.book_new();
            
            // Summary sheet
            const summaryData = this.createCategorySummary(categoryData);
            const summarySheet = XLSX.utils.json_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
            
            // Raw data sheet
            const rawSheet = XLSX.utils.json_to_sheet(categoryData);
            XLSX.utils.book_append_sheet(workbook, rawSheet, 'Raw Data');
            
            // Biomarker-specific sheets
            const biomarkers = [...new Set(categoryData.map(d => d.biomarker))];
            biomarkers.forEach(biomarker => {
                const biomarkerData = categoryData.filter(d => d.biomarker === biomarker);
                const biomarkerSheet = XLSX.utils.json_to_sheet(biomarkerData);
                const sheetName = biomarker.substring(0, 31); // Excel sheet name limit
                XLSX.utils.book_append_sheet(workbook, biomarkerSheet, sheetName);
            });
            
            // Write file
            XLSX.writeFile(workbook, filePath);
            exportedFiles.push({
                category,
                fileName,
                filePath,
                recordCount: categoryData.length,
                biomarkers: biomarkers.length
            });
            
            console.log(`✅ Exported ${category} data: ${categoryData.length} records to ${fileName}`);
        });
        
        // Create master summary file
        this.createMasterSummary(data, exportDir, organizationName, timestamp);
        
        return {
            exportDir,
            exportedFiles,
            totalRecords: data.length,
            timestamp
        };
    }

    createCategorySummary(categoryData) {
        const employees = [...new Set(categoryData.map(d => d.profileId))];
        const biomarkers = [...new Set(categoryData.map(d => d.biomarker))];
        const dateRange = {
            start: moment.min(categoryData.map(d => moment(d.date))).format('YYYY-MM-DD'),
            end: moment.max(categoryData.map(d => moment(d.date))).format('YYYY-MM-DD')
        };
        
        const summary = [
            { metric: 'Total Employees', value: employees.length },
            { metric: 'Total Biomarkers', value: biomarkers.length },
            { metric: 'Total Records', value: categoryData.length },
            { metric: 'Date Range Start', value: dateRange.start },
            { metric: 'Date Range End', value: dateRange.end },
            { metric: 'Days Covered', value: moment(dateRange.end).diff(moment(dateRange.start), 'days') + 1 }
        ];
        
        // Add biomarker statistics
        biomarkers.forEach(biomarker => {
            const biomarkerData = categoryData.filter(d => d.biomarker === biomarker);
            const values = biomarkerData.map(d => parseFloat(d.value)).filter(v => !isNaN(v));
            
            if (values.length > 0) {
                summary.push(
                    { metric: `${biomarker} - Average`, value: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100 },
                    { metric: `${biomarker} - Min`, value: Math.min(...values) },
                    { metric: `${biomarker} - Max`, value: Math.max(...values) },
                    { metric: `${biomarker} - Records`, value: values.length }
                );
            }
        });
        
        return summary;
    }

    createMasterSummary(data, exportDir, organizationName, timestamp) {
        const fileName = `${organizationName}_MASTER_SUMMARY_${timestamp}.xlsx`;
        const filePath = path.join(exportDir, fileName);
        
        const workbook = XLSX.utils.book_new();
        
        // Organization overview
        const overview = [
            { metric: 'Organization', value: organizationName },
            { metric: 'Export Date', value: moment().format('YYYY-MM-DD HH:mm:ss') },
            { metric: 'Total Employees', value: [...new Set(data.map(d => d.profileId))].length },
            { metric: 'Total Records', value: data.length },
            { metric: 'Categories', value: [...new Set(data.map(d => d.category))].join(', ') },
            { metric: 'Total Biomarkers', value: [...new Set(data.map(d => d.biomarker))].length }
        ];
        
        const overviewSheet = XLSX.utils.json_to_sheet(overview);
        XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Organization Overview');
        
        // Employee summary
        const employees = [...new Set(data.map(d => d.profileId))];
        const employeeSummary = employees.map(employeeId => {
            const employeeData = data.filter(d => d.profileId === employeeId);
            const categories = [...new Set(employeeData.map(d => d.category))];
            const biomarkers = [...new Set(employeeData.map(d => d.biomarker))];
            
            return {
                employeeId: employeeData[0].employeeId || employeeId,
                profileId: employeeId,
                totalRecords: employeeData.length,
                categories: categories.join(', '),
                biomarkerCount: biomarkers.length,
                dataPoints: employeeData.length
            };
        });
        
        const employeeSheet = XLSX.utils.json_to_sheet(employeeSummary);
        XLSX.utils.book_append_sheet(workbook, employeeSheet, 'Employee Summary');
        
        // Category breakdown
        const categories = [...new Set(data.map(d => d.category))];
        const categoryBreakdown = categories.map(category => {
            const categoryData = data.filter(d => d.category === category);
            const biomarkers = [...new Set(categoryData.map(d => d.biomarker))];
            
            return {
                category,
                records: categoryData.length,
                biomarkers: biomarkers.length,
                employees: [...new Set(categoryData.map(d => d.profileId))].length,
                biomarkerList: biomarkers.join(', ')
            };
        });
        
        const categorySheet = XLSX.utils.json_to_sheet(categoryBreakdown);
        XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Breakdown');
        
        XLSX.writeFile(workbook, filePath);
        console.log(`📊 Created master summary: ${fileName}`);
        
        return filePath;
    }

    // Export for specific organizational use cases
    exportForTruckingCompany(driverData) {
        console.log('🚛 Generating trucking company health analytics export...');
        
        // Focus on safety-critical biomarkers
        const truckingRelevantData = driverData.filter(record => {
            const criticalBiomarkers = [
                'sleep_duration', 'sleep_quality', 'sleep_debt',
                'stress_level', 'energy_level', 'focus_score',
                'heart_rate_average', 'resting_heart_rate',
                'activity_level', 'fatigue_score'
            ];
            return criticalBiomarkers.includes(record.biomarker);
        });
        
        return this.exportByCategoryToExcel(truckingRelevantData, 'TruckingCompany');
    }

    exportForMilitaryPlatoon(soldierData) {
        console.log('🪖 Generating military platoon health analytics export...');
        
        // Focus on performance and readiness biomarkers
        const militaryRelevantData = soldierData.filter(record => {
            const performanceBiomarkers = [
                'sleep_duration', 'sleep_quality', 'recovery_time',
                'stress_level', 'energy_level', 'physical_readiness',
                'heart_rate_variability', 'exercise_capacity',
                'mental_resilience', 'cognitive_load'
            ];
            return performanceBiomarkers.includes(record.biomarker);
        });
        
        return this.exportByCategoryToExcel(militaryRelevantData, 'MilitaryPlatoon');
    }
}

// CLI interface
if (require.main === module) {
    const { program } = require('commander');
    const chalk = require('chalk');
    
    program
        .version('1.0.0')
        .description('Enterprise Biomarker Data Exporter');
    
    program
        .command('demo')
        .description('Generate sample data and export to Excel')
        .option('-e, --employees <number>', 'Number of employees', '25')
        .option('-d, --days <number>', 'Number of days of data', '30')
        .option('-o, --organization <name>', 'Organization name', 'DemoOrganization')
        .action((options) => {
            console.log(chalk.blue('🏢 Generating enterprise health analytics demo...'));
            
            const exporter = new BiomarkerExporter();
            
            // Generate sample profile IDs
            const profileIds = Array.from({ length: parseInt(options.employees) }, (_, i) => 
                `profile-${String(i + 1).padStart(3, '0')}`
            );
            
            console.log(chalk.yellow(`📊 Generating data for ${options.employees} employees over ${options.days} days...`));
            const sampleData = exporter.generateSampleData(profileIds, parseInt(options.days));
            
            console.log(chalk.green(`✅ Generated ${sampleData.length} biomarker records`));
            
            const result = exporter.exportByCategoryToExcel(sampleData, options.organization);
            
            console.log(chalk.green(`\n🎉 Export complete!`));
            console.log(chalk.cyan(`📁 Export directory: ${result.exportDir}`));
            console.log(chalk.cyan(`📈 Total records: ${result.totalRecords}`));
            console.log(chalk.cyan(`📋 Files created: ${result.exportedFiles.length}`));
            
            result.exportedFiles.forEach(file => {
                console.log(chalk.gray(`   - ${file.fileName} (${file.recordCount} records, ${file.biomarkers} biomarkers)`));
            });
        });
    
    program.parse();
}

module.exports = BiomarkerExporter;