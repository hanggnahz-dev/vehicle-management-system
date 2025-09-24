#!/usr/bin/env node

/**
 * 为上海物流集团插入300条车辆测试数据
 * 使用方法: node scripts/insert-shanghai-vehicles.js
 */

import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 数据库文件路径
const dbPath = path.join(__dirname, '..', 'data', 'database.sqlite')

// 生成随机车牌号
function generateLicensePlate() {
  const prefixes = [
    '沪A',
    '沪B',
    '沪C',
    '沪D',
    '沪E',
    '沪F',
    '沪G',
    '沪H',
    '沪J',
    '沪K',
    '沪L',
    '沪M',
    '沪N',
    '沪P',
    '沪Q',
    '沪R',
    '沪S',
    '沪T',
    '沪U',
    '沪V',
    '沪W',
    '沪X',
    '沪Y',
    '沪Z',
  ]
  const numbers = Math.floor(Math.random() * 90000) + 10000 // 5位数字
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  return `${prefix}${numbers}`
}

// 生成随机审证日期（未来1年内）
function generateInspectionDate() {
  const today = new Date()
  const futureDate = new Date(today.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000)
  return futureDate.toISOString().split('T')[0] // YYYY-MM-DD格式
}

// 生成车辆数据
function generateVehicleData(count) {
  const vehicles = []
  const companyName = '上海物流集团'

  for (let i = 0; i < count; i++) {
    let licensePlate
    let attempts = 0

    // 确保车牌号唯一
    do {
      licensePlate = generateLicensePlate()
      attempts++
    } while (vehicles.some(v => v.license_plate === licensePlate) && attempts < 100)

    if (attempts >= 100) {
      console.warn(`警告: 生成第${i + 1}个车牌号时尝试次数过多，使用带序号的车牌号`)
      licensePlate = `沪A${String(10000 + i).padStart(5, '0')}`
    }

    vehicles.push({
      company_name: companyName,
      license_plate: licensePlate,
      inspection_date: generateInspectionDate(),
    })
  }

  return vehicles
}

// 插入数据到数据库
async function insertVehicles(vehicles) {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    console.log('✅ 数据库连接成功')

    // 开始事务
    await db.exec('BEGIN TRANSACTION')

    let successCount = 0
    let duplicateCount = 0

    for (let i = 0; i < vehicles.length; i++) {
      const vehicle = vehicles[i]

      try {
        await db.run(
          `
          INSERT OR IGNORE INTO vehicles (company_name, license_plate, inspection_date) 
          VALUES (?, ?, ?)
        `,
          [vehicle.company_name, vehicle.license_plate, vehicle.inspection_date]
        )

        // 检查是否实际插入了数据
        const result = await db.get('SELECT changes() as changes')
        if (result.changes > 0) {
          successCount++
          if (successCount % 50 === 0) {
            console.log(`📊 已插入 ${successCount} 条记录...`)
          }
        } else {
          duplicateCount++
          console.log(`⚠️  车牌号 ${vehicle.license_plate} 已存在，跳过`)
        }
      } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          duplicateCount++
          console.log(`⚠️  车牌号 ${vehicle.license_plate} 已存在，跳过`)
        } else {
          console.error(`❌ 插入车辆 ${vehicle.license_plate} 失败:`, err.message)
        }
      }
    }

    // 提交事务
    await db.exec('COMMIT')
    console.log('✅ 事务提交成功')

    console.log(`📊 插入结果统计:`)
    console.log(`  ✅ 成功插入: ${successCount} 条`)
    console.log(`  ⚠️  重复跳过: ${duplicateCount} 条`)
    console.log(`  📝 总计处理: ${vehicles.length} 条`)

    await db.close()
    console.log('✅ 数据库连接已关闭')

    return { successCount, duplicateCount }
  } catch (error) {
    console.error('❌ 插入数据失败:', error.message)
    throw error
  }
}

// 验证插入结果
async function verifyInsertion() {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    // 查询上海物流集团的车辆数量
    const countResult = await db.get(
      'SELECT COUNT(*) as count FROM vehicles WHERE company_name = ?',
      ['上海物流集团']
    )
    console.log(`📊 上海物流集团当前车辆数量: ${countResult.count} 辆`)

    // 查询最近的几条记录
    const recentRecords = await db.all(
      'SELECT license_plate, inspection_date FROM vehicles WHERE company_name = ? ORDER BY id DESC LIMIT 5',
      ['上海物流集团']
    )

    console.log('📋 最近插入的5条记录:')
    recentRecords.forEach((row, index) => {
      console.log(`  ${index + 1}. 车牌号: ${row.license_plate}, 审证日期: ${row.inspection_date}`)
    })

    await db.close()
    return countResult.count
  } catch (error) {
    console.error('❌ 验证插入结果失败:', error.message)
    throw error
  }
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始为上海物流集团插入300条车辆测试数据...')
    console.log('')

    // 生成车辆数据
    console.log('📝 生成车辆数据...')
    const vehicles = generateVehicleData(300)
    console.log(`✅ 生成了 ${vehicles.length} 条车辆数据`)

    // 显示前5条数据示例
    console.log('📋 数据示例:')
    vehicles.slice(0, 5).forEach((vehicle, index) => {
      console.log(
        `  ${index + 1}. 公司: ${vehicle.company_name}, 车牌: ${vehicle.license_plate}, 审证日期: ${vehicle.inspection_date}`
      )
    })
    console.log('')

    // 插入数据
    console.log('💾 开始插入数据到数据库...')
    const result = await insertVehicles(vehicles)
    console.log('')

    // 验证插入结果
    console.log('🔍 验证插入结果...')
    const totalCount = await verifyInsertion()
    console.log('')

    console.log('🎉 数据插入完成！')
    console.log(`📊 最终统计: 上海物流集团共有 ${totalCount} 辆车辆`)
  } catch (error) {
    console.error('❌ 执行失败:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { generateVehicleData, insertVehicles, verifyInsertion }
