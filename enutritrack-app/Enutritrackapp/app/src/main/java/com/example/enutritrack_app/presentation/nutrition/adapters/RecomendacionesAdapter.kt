package com.example.enutritrack_app.presentation.nutrition.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.enutritrack_app.data.local.entities.RecomendacionEntity
import com.example.enutritrack_app.databinding.ItemRecomendacionBinding
import java.text.SimpleDateFormat
import java.util.*

class RecomendacionesAdapter(
    private val dateFormat: SimpleDateFormat
) : ListAdapter<RecomendacionEntity, RecomendacionesAdapter.RecomendacionViewHolder>(RecomendacionDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecomendacionViewHolder {
        val binding = ItemRecomendacionBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return RecomendacionViewHolder(binding)
    }

    override fun onBindViewHolder(holder: RecomendacionViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class RecomendacionViewHolder(
        private val binding: ItemRecomendacionBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(recomendacion: RecomendacionEntity) {
            binding.contenidoText.text = recomendacion.contenido
            binding.fechaText.text = dateFormat.format(Date(recomendacion.fecha_generacion))
        }
    }

    private class RecomendacionDiffCallback : DiffUtil.ItemCallback<RecomendacionEntity>() {
        override fun areItemsTheSame(
            oldItem: RecomendacionEntity,
            newItem: RecomendacionEntity
        ): Boolean = oldItem.id == newItem.id

        override fun areContentsTheSame(
            oldItem: RecomendacionEntity,
            newItem: RecomendacionEntity
        ): Boolean = oldItem == newItem
    }
}

