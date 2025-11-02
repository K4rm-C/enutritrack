package com.example.enutritrack_app.presentation.nutrition.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.enutritrack_app.data.local.entities.RegistroComidaEntity
import com.example.enutritrack_app.data.local.entities.TipoComidaEnum
import com.example.enutritrack_app.databinding.ItemRegistroComidaBinding
import java.text.SimpleDateFormat
import java.util.*

class RegistrosComidaAdapter(
    private val dateFormat: SimpleDateFormat,
    private val onVerDetalleClick: (String) -> Unit,
    private val onEditarClick: (String) -> Unit
) : ListAdapter<RegistroComidaEntity, RegistrosComidaAdapter.RegistroComidaViewHolder>(RegistroComidaDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RegistroComidaViewHolder {
        val binding = ItemRegistroComidaBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return RegistroComidaViewHolder(binding)
    }

    override fun onBindViewHolder(holder: RegistroComidaViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class RegistroComidaViewHolder(
        private val binding: ItemRegistroComidaBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(registro: RegistroComidaEntity) {
            // Tipo de comida
            binding.tipoComidaText.text = formatTipoComida(registro.tipo_comida)
            
            // Fecha
            binding.fechaText.text = dateFormat.format(Date(registro.fecha))
            
            // Resumen nutricional (placeholder - se calculará en la vista de detalle)
            binding.resumenNutricionalText.text = "Ver detalles para información nutricional"
            
            // Botones
            binding.verDetalleButton.setOnClickListener {
                onVerDetalleClick(registro.id)
            }
            
            binding.editarButton.setOnClickListener {
                onEditarClick(registro.id)
            }
        }

        private fun formatTipoComida(tipo: TipoComidaEnum): String {
            return when (tipo) {
                TipoComidaEnum.DESAYUNO -> "Desayuno"
                TipoComidaEnum.ALMUERZO -> "Almuerzo"
                TipoComidaEnum.CENA -> "Cena"
                TipoComidaEnum.MERIENDA -> "Merienda"
            }
        }
    }

    private class RegistroComidaDiffCallback : DiffUtil.ItemCallback<RegistroComidaEntity>() {
        override fun areItemsTheSame(
            oldItem: RegistroComidaEntity,
            newItem: RegistroComidaEntity
        ): Boolean = oldItem.id == newItem.id

        override fun areContentsTheSame(
            oldItem: RegistroComidaEntity,
            newItem: RegistroComidaEntity
        ): Boolean = oldItem == newItem
    }
}

