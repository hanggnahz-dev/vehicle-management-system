import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import type { CreateVehicleData } from '@/stores/vehicle'

export interface ParseResult {
  data: CreateVehicleData[]
  errors: string[]
}

/**
 * 解析Excel文件
 */
export function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise(resolve => {
    const reader = new FileReader()
    const errors: string[] = []

    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })

        // 获取第一个工作表
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // 转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        if (jsonData.length < 2) {
          errors.push('文件至少需要包含标题行和一行数据')
          resolve({ data: [], errors })
          return
        }

        // 第一行是标题
        const headers = jsonData[0] as string[]
        const dataRows = jsonData.slice(1) as any[][]

        // 查找必需的列
        const companyNameIndex = findColumnIndex(headers, [
          '公司名称',
          '公司',
          'company_name',
          'company',
        ])
        const licensePlateIndex = findColumnIndex(headers, [
          '车牌号',
          '车牌',
          'license_plate',
          'license',
        ])
        const inspectionDateIndex = findColumnIndex(headers, [
          '审证日期',
          '审证',
          'inspection_date',
          'inspection',
        ])

        if (companyNameIndex === -1) {
          errors.push('未找到"公司名称"列')
        }
        if (licensePlateIndex === -1) {
          errors.push('未找到"车牌号"列')
        }
        if (inspectionDateIndex === -1) {
          errors.push('未找到"审证日期"列')
        }

        if (errors.length > 0) {
          resolve({ data: [], errors })
          return
        }

        // 解析数据行
        const vehicles: CreateVehicleData[] = []

        dataRows.forEach((row, index) => {
          const rowNumber = index + 2 // 实际行号（包含标题行）

          try {
            const companyName = String(row[companyNameIndex] || '').trim()
            const licensePlate = String(row[licensePlateIndex] || '').trim()
            const inspectionDate = String(row[inspectionDateIndex] || '').trim()

            if (!companyName) {
              errors.push(`第${rowNumber}行：公司名称不能为空`)
              return
            }

            if (!licensePlate) {
              errors.push(`第${rowNumber}行：车牌号不能为空`)
              return
            }

            if (!inspectionDate) {
              errors.push(`第${rowNumber}行：审证日期不能为空`)
              return
            }

            // 验证日期格式
            const date = new Date(inspectionDate)
            if (isNaN(date.getTime())) {
              errors.push(`第${rowNumber}行：审证日期格式错误，应为YYYY-MM-DD格式`)
              return
            }

            vehicles.push({
              company_name: companyName,
              license_plate: licensePlate,
              inspection_date: inspectionDate,
            })
          } catch (error) {
            errors.push(`第${rowNumber}行：数据解析错误`)
          }
        })

        resolve({ data: vehicles, errors })
      } catch (error) {
        errors.push('文件解析失败：' + (error instanceof Error ? error.message : '未知错误'))
        resolve({ data: [], errors })
      }
    }

    reader.onerror = () => {
      errors.push('文件读取失败')
      resolve({ data: [], errors })
    }

    reader.readAsArrayBuffer(file)
  })
}

/**
 * 解析CSV文件
 */
export function parseCSVFile(file: File): Promise<ParseResult> {
  return new Promise(resolve => {
    const errors: string[] = []

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        try {
          if (results.errors.length > 0) {
            errors.push(...results.errors.map(err => `第${err.row}行：${err.message}`))
          }

          const data = results.data as any[]

          if (data.length === 0) {
            errors.push('文件没有有效数据')
            resolve({ data: [], errors })
            return
          }

          // 查找必需的列
          const headers = Object.keys(data[0])
          const companyNameKey = '公司名称'
          const licensePlateKey = '车牌号'
          const inspectionDateKey = '审证日期'

          if (!companyNameKey) {
            errors.push('未找到"公司名称"列')
          }
          if (!licensePlateKey) {
            errors.push('未找到"车牌号"列')
          }
          if (!inspectionDateKey) {
            errors.push('未找到"审证日期"列')
          }

          if (errors.length > 0) {
            resolve({ data: [], errors })
            return
          }

          // 解析数据
          const vehicles: CreateVehicleData[] = []

          data.forEach((row, index) => {
            const rowNumber = index + 2 // 实际行号（包含标题行）

            try {
              const companyName = String(row[companyNameKey] || '').trim()
              const licensePlate = String(row[licensePlateKey] || '').trim()
              const inspectionDate = String(row[inspectionDateKey] || '').trim()

              if (!companyName) {
                errors.push(`第${rowNumber}行：公司名称不能为空`)
                return
              }

              if (!licensePlate) {
                errors.push(`第${rowNumber}行：车牌号不能为空`)
                return
              }

              if (!inspectionDate) {
                errors.push(`第${rowNumber}行：审证日期不能为空`)
                return
              }

              // 验证日期格式
              const date = new Date(inspectionDate)
              if (isNaN(date.getTime())) {
                errors.push(`第${rowNumber}行：审证日期格式错误，应为YYYY-MM-DD格式`)
                return
              }

              vehicles.push({
                company_name: companyName,
                license_plate: licensePlate,
                inspection_date: inspectionDate,
              })
            } catch (error) {
              errors.push(`第${rowNumber}行：数据解析错误`)
            }
          })

          resolve({ data: vehicles, errors })
        } catch (error) {
          errors.push('CSV解析失败：' + (error instanceof Error ? error.message : '未知错误'))
          resolve({ data: [], errors })
        }
      },
      error: error => {
        errors.push('CSV解析失败：' + error.message)
        resolve({ data: [], errors })
      },
    })
  })
}

/**
 * 根据文件名自动选择解析方法
 */
export function parseFile(file: File): Promise<ParseResult> {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.csv')) {
    return parseCSVFile(file)
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcelFile(file)
  } else {
    return Promise.resolve({
      data: [],
      errors: ['不支持的文件格式，请使用Excel或CSV文件'],
    })
  }
}

/**
 * 查找列索引
 */
function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex(header => header.toLowerCase().includes(name.toLowerCase()))
    if (index !== -1) return index
  }
  return -1
}

/**
 * 查找列键名
 */
function findColumnKey(headers: string[], possibleNames: string[]): string | null {
  for (const name of possibleNames) {
    const key = headers.find(header => header.toLowerCase().includes(name.toLowerCase()))
    if (key) return key
  }
  return null
}
