#!/bin/bash

# SQLite数据库管理脚本

DB_PATH="data/database.sqlite"

# 检查数据库文件是否存在
if [ ! -f "$DB_PATH" ]; then
    echo "❌ 数据库文件不存在: $DB_PATH"
    echo "请先启动后端服务以创建数据库"
    exit 1
fi

echo "📊 SQLite数据库管理工具"
echo "数据库路径: $DB_PATH"
echo ""

case "$1" in
    "tables")
        echo "📋 数据库表列表:"
        sqlite3 "$DB_PATH" ".tables"
        ;;
    "schema")
        echo "📋 数据库表结构:"
        sqlite3 "$DB_PATH" ".schema"
        ;;
    "users")
        echo "👥 用户数据:"
        sqlite3 "$DB_PATH" "SELECT id, name, email, status, created_at FROM users;"
        ;;
    "vehicles")
        echo "🚗 车辆数据:"
        sqlite3 "$DB_PATH" "SELECT id, company_name, license_plate, inspection_date, created_at FROM vehicles;"
        ;;
    "roles")
        echo "🔐 角色数据:"
        sqlite3 "$DB_PATH" "SELECT id, name, description, created_at FROM roles;"
        ;;
    "count")
        echo "📊 数据统计:"
        echo "用户数量: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM users;")"
        echo "车辆数量: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM vehicles;")"
        echo "角色数量: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM roles;")"
        ;;
    "backup")
        BACKUP_FILE="data/database_backup_$(date +%Y%m%d_%H%M%S).sqlite"
        cp "$DB_PATH" "$BACKUP_FILE"
        echo "✅ 数据库备份完成: $BACKUP_FILE"
        ;;
    "restore")
        if [ -z "$2" ]; then
            echo "❌ 请指定备份文件路径"
            echo "用法: $0 restore <backup_file>"
            exit 1
        fi
        if [ ! -f "$2" ]; then
            echo "❌ 备份文件不存在: $2"
            exit 1
        fi
        cp "$2" "$DB_PATH"
        echo "✅ 数据库恢复完成: $2 -> $DB_PATH"
        ;;
    "reset")
        echo "⚠️  警告: 这将删除所有数据并重新初始化数据库"
        read -p "确定要继续吗? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -f "$DB_PATH"
            echo "✅ 数据库已重置，请重启后端服务以重新初始化"
        else
            echo "❌ 操作已取消"
        fi
        ;;
    *)
        echo "用法: $0 <command>"
        echo ""
        echo "可用命令:"
        echo "  tables    - 显示所有表"
        echo "  schema    - 显示表结构"
        echo "  users     - 显示用户数据"
        echo "  vehicles  - 显示车辆数据"
        echo "  roles     - 显示角色数据"
        echo "  count     - 显示数据统计"
        echo "  backup    - 备份数据库"
        echo "  restore   - 恢复数据库"
        echo "  reset     - 重置数据库（删除所有数据）"
        echo ""
        echo "示例:"
        echo "  $0 tables"
        echo "  $0 users"
        echo "  $0 backup"
        echo "  $0 restore data/database_backup_20231201_120000.sqlite"
        ;;
esac
